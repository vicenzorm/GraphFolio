/// <reference types="astro/client" />
import '../styles/tokens.css';
import * as d3 from 'd3';
import Fuse from 'fuse.js';
import { marked } from 'marked';

// Types
interface GraphNode {
  id: string;
  title: string;
  type: string;
  year?: number;
  description: string;
  body: string;
  x?: number;
  y?: number;
}

interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Constants
const NODE_COLORS: Record<string, string> = { project: '#0087BD', technology: '#009F6B', concept: '#FFD700', social: '#FF1493', experience: '#C40233' };
const NODE_RADII: Record<string, number> = { project: 18, technology: 10, concept: 7, social: 9, experience: 12 };

// State
let flyToFn: ((nodeId: string) => void) | null = null;
let allNodes: GraphNode[] = [];
let bufferVisible = false;
let searchVisible = false;
let fuseIdx: Fuse<GraphNode> | null = null;
let sResults: GraphNode[] = [];
let sIdx = 0;
let searchKeyHandler: ((e: KeyboardEvent) => void) | null = null;

// ====== NODE BUFFER ======

function closeBuffer(): void {
  if (!bufferVisible) return;
  bufferVisible = false;
  const bd = document.querySelector('.node-buffer-backdrop');
  if (bd) {
    const pnl = bd.querySelector('div') as HTMLElement;
    if (pnl) pnl.classList.remove('visible');
    setTimeout(() => bd.remove(), 130);
  }
}

function openBuffer(node: GraphNode): void {
  closeBuffer();
  const bd = document.createElement('div');
  bd.className = 'node-buffer-backdrop';
  const pnl = document.createElement('div');
  const rendered = marked.parse(node.body, { async: false }) as string;
  pnl.innerHTML = `
    <div class="buffer-header">
      <div class="buffer-dots"><span class="buffer-dot red"></span><span class="buffer-dot yellow"></span><span class="buffer-dot green"></span></div>
      <span class="buffer-title">${node.title}</span>
      <button class="buffer-close" aria-label="Close">Close</button>
    </div>
    <div class="buffer-body">${rendered.replace(/\[\[([^\]]+)\]\]/g, '<span class="wikilink">$1</span>')}</div>
  `;
  bd.appendChild(pnl);
  const handleClose = () => closeBuffer();
  pnl.querySelector('.buffer-close')!.addEventListener('click', handleClose);
  bd.addEventListener('click', (e) => { if (e.target === bd) handleClose(); });
  document.body.appendChild(bd);
  bufferVisible = true;
  requestAnimationFrame(() => pnl.classList.add('visible'));
}

// ====== OMNI SEARCH ======

function closeSearch(): void {
  searchVisible = false; sResults = [];
  if (searchKeyHandler) {
    document.removeEventListener('keydown', searchKeyHandler);
    searchKeyHandler = null;
  }
  const el = document.querySelector('.omni-backdrop');
  if (el) { el.querySelector('div')?.classList.remove('visible'); setTimeout(() => el.remove(), 130); }
}

function updateActiveResult(bd: HTMLElement, shouldScroll = true): void {
  const items = bd.querySelectorAll('.omni-result');
  items.forEach((el, idx) => {
    const isActive = idx === sIdx;
    el.classList.toggle('active', isActive);
    el.setAttribute('aria-selected', isActive ? 'true' : 'false');
    if (isActive && shouldScroll) {
      (el as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  });
}

function moveSelection(delta: number, bd: HTMLElement): void {
  if (sResults.length === 0) return;
  sIdx = (sIdx + delta + sResults.length) % sResults.length;
  updateActiveResult(bd, true);
}

function renderResults(bd: HTMLElement): void {
  const rl = bd.querySelector('.omni-results');
  if (!rl) return;
  if (sResults.length === 0) {
    rl.innerHTML = '<div class="omni-empty">No matches found.</div>';
    return;
  }

  rl.innerHTML = sResults.map((n, i) => {
    const col = NODE_COLORS[n.type] || '#696969';
    return `<div class="omni-result${i === sIdx ? ' active' : ''}" role="option" aria-selected="${i === sIdx ? 'true' : 'false'}" data-i="${i}">
      <span class="omni-badge" style="background:${col}22;color:${col};border:1px solid ${col}55">${n.type.toUpperCase()}</span>
      <span class="omni-result-title">${n.title}</span>
      ${n.description ? `<span class="omni-result-desc"> — ${n.description}</span>` : ''}</div>`;
  }).join('');

  rl.querySelectorAll('.omni-result').forEach(el => {
    el.addEventListener('mousemove', () => {
      const idx = parseInt((el as HTMLElement).dataset.i || '-1');
      if (Number.isNaN(idx) || idx === sIdx) return;
      sIdx = idx;
      updateActiveResult(bd, false);
    });

    el.addEventListener('click', () => {
      const idx = parseInt((el as HTMLElement).dataset.i || '0');
      const targetId = sResults[idx]?.id;
      if (!targetId) return;
      closeSearch();
      closeBuffer();
      if (flyToFn) flyToFn(targetId);
    });
  });

  updateActiveResult(bd, true);
}

function openOmniSearch(nodes: GraphNode[]): void {
  if (searchVisible) return;
  searchVisible = true; sIdx = 0;
  fuseIdx = new Fuse(nodes, {
    keys: [{ name: 'title', weight: 0.7 }, { name: 'description', weight: 0.4 }, { name: 'body', weight: 0.2 }],
    threshold: 0.35,
  });
  sResults = nodes.slice(0, 15);
  const bd = document.createElement('div');
  bd.className = 'omni-backdrop';
  bd.innerHTML = `
    <div>
      <input class="omni-input" type="text" placeholder="Type to search nodes..." autocomplete="off" />
      <div class="omni-results" role="listbox"></div>
      <div class="omni-footer"><span>Enter: open</span><span>↑↓ / Ctrl+N,P: navigate</span><span>Esc: close</span></div>
    </div>`;
  const inputEl = bd.querySelector('.omni-input') as HTMLInputElement | null;
  inputEl?.addEventListener('input', function() {
    const q = (this as HTMLInputElement).value.trim();
    if (!q || !fuseIdx) { sResults = nodes.slice(0, 15); }
    else { sResults = fuseIdx.search(q).slice(0, 15).map(r => r.item); }
    sIdx = 0; renderResults(bd);
  });
  bd.addEventListener('click', (e) => { if (e.target === bd) closeSearch(); });
  searchKeyHandler = (e: KeyboardEvent) => {
    if (!searchVisible) return;
    const key = e.key.toLowerCase();

    if (e.key === 'Escape') {
      e.preventDefault();
      closeSearch();
      return;
    }

    if (e.key === 'ArrowDown' || (e.ctrlKey && key === 'n' && !e.metaKey) || (e.ctrlKey && key === 'j' && !e.metaKey)) {
      e.preventDefault();
      moveSelection(1, bd);
      return;
    }

    if (e.key === 'ArrowUp' || (e.ctrlKey && key === 'p' && !e.metaKey) || (e.ctrlKey && key === 'k' && !e.metaKey)) {
      e.preventDefault();
      moveSelection(-1, bd);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (sResults[sIdx] && flyToFn) {
        const targetId = sResults[sIdx].id;
        closeSearch();
        closeBuffer();
        flyToFn(targetId);
      }
    }
  };
  document.addEventListener('keydown', searchKeyHandler);
  document.body.appendChild(bd);
  requestAnimationFrame(() => {
    bd.querySelector('div')?.classList.add('visible');
    inputEl?.focus();
    renderResults(bd);
  });
}

// ====== GLOBAL KEYS ======

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (allNodes.length > 0) openOmniSearch(allNodes);
    return;
  }
  if (e.key === 'Escape' && (bufferVisible || searchVisible)) {
    e.preventDefault(); closeBuffer(); closeSearch();
  }
});

// ====== GRAPH ======

function mountGraph(container: HTMLElement, data: GraphData): void {
  if (data.nodes.length === 0) {
    container.innerHTML = '<p style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:var(--text-dim);font-family:var(--font-mono)">No graph data.</p>';
    return;
  }

  allNodes = data.nodes;
  const width = window.innerWidth; const height = window.innerHeight;

  const tooltip = document.createElement('div');
  tooltip.className = 'graph-tooltip';
  document.body.appendChild(tooltip);

  const svg = d3.select(container).append('svg').attr('width', '100%').attr('height', '100%');
  const g = svg.append('g');
  const zoom = d3.zoom<HTMLSvgElement, unknown>().scaleExtent([0.3, 3]).on('zoom', (ev) => g.attr('transform', ev.transform));
  svg.call(zoom);

  const edgesSel = g.append('g').attr('class', 'edges').selectAll<SVGLineElement, GraphEdge>('line').data(data.edges).join('line')
    .attr('stroke', '#696969').attr('stroke-opacity', 0.4).attr('stroke-width', 1);

  const nodeSel = g.append('g').attr('class', 'nodes').selectAll<SVGGElement, GraphNode>('g').data(data.nodes).join('g').attr('cursor', 'pointer');
  nodeSel.append('circle').attr('r', (d: GraphNode) => NODE_RADII[d.type] || 10)
    .attr('fill', (d: GraphNode) => NODE_COLORS[d.type] || '#009F6B')
    .attr('stroke', 'rgba(198,198,196,0.2)').attr('stroke-width', 1);
  nodeSel.append('text').text((d: GraphNode) => d.title).attr('text-anchor', 'middle')
    .attr('dy', (d: GraphNode) => (NODE_RADII[d.type] || 10) + 14).attr('fill', '#C6C6C4')
    .attr('font-size', (d: GraphNode) => { const r = NODE_RADII[d.type] || 10; return r >= 18 ? '11px' : r >= 10 ? '9px' : '7px'; })
    .attr('font-family', "'JetBrains Mono', monospace").attr('pointer-events', 'none')
    .style('text-shadow', '0 0 6px rgba(0,0,0,0.9)');

  const adj = new Map<string, Set<string>>();
  for (const e of data.edges) {
    const s = typeof e.source === 'string' ? e.source : e.source.id;
    const t = typeof e.target === 'string' ? e.target : e.target.id;
    if (!adj.has(s)) adj.set(s, new Set()); if (!adj.has(t)) adj.set(t, new Set());
    adj.get(s)!.add(t); adj.get(t)!.add(s);
  }

  nodeSel.on('mouseover', function (ev: MouseEvent, d: GraphNode) {
    const connected = adj.get(d.id) || new Set();
    d3.select(this).select('circle').transition().duration(100).attr('transform', 'scale(1.6)');
    tooltip.innerHTML = `<strong>${d.title}</strong><br>${d.description || ''}`;
    tooltip.style.left = (ev.pageX + 16) + 'px'; tooltip.style.top = (ev.pageY - 12) + 'px';
    tooltip.classList.add('visible');
    nodeSel.transition().duration(100).attr('opacity', (n: GraphNode) => (n.id === d.id || connected.has(n.id)) ? 1 : 0.15);
    edgesSel.transition().duration(100)
      .attr('stroke-opacity', (e: GraphEdge) => { const s = typeof e.source === 'string' ? e.source : (e.source as GraphNode).id; const t = typeof e.target === 'string' ? e.target : (e.target as GraphNode).id; return (s === d.id || t === d.id) ? 1 : 0.06; })
      .attr('stroke', (e: GraphEdge) => { const s = typeof e.source === 'string' ? e.source : (e.source as GraphNode).id; const t = typeof e.target === 'string' ? e.target : (e.target as GraphNode).id; return (s === d.id || t === d.id) ? (NODE_COLORS[d.type] || '#0087BD') : '#696969'; });
  })
  .on('mousemove', function (ev: MouseEvent) { tooltip.style.left = (ev.pageX + 16) + 'px'; tooltip.style.top = (ev.pageY - 12) + 'px'; })
  .on('mouseout', function () {
    d3.select(this).select('circle').transition().duration(200).attr('transform', 'scale(1)');
    tooltip.classList.remove('visible'); nodeSel.transition().duration(200).attr('opacity', 1); edgesSel.transition().duration(200).attr('stroke-opacity', 0.4).attr('stroke', '#696969');
  })
  .on('click', function (ev: MouseEvent, d: GraphNode) { ev.stopPropagation(); openBuffer(d); });

  const drag = d3.drag<SVGGElement, GraphNode>()
    .on('start', function (ev: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) { if (!ev.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
    .on('drag', function (ev: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) { d.fx = ev.x; d.fy = ev.y; })
    .on('end', function (ev: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>, d: GraphNode) { if (!ev.active) sim.alphaTarget(0); d.fx = null; d.fy = null; });
  nodeSel.call(drag);

  const sim = d3.forceSimulation<GraphNode>(data.nodes as any)
    .force('charge', d3.forceManyBody().strength(-200))
    .force('link', d3.forceLink<GraphNode, any>(data.edges as any).id((d: GraphNode) => d.id).distance(80))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide<GraphNode>().radius((d: GraphNode) => (NODE_RADII[d.type] || 10) + 4))
    .on('tick', () => {
      edgesSel.attr('x1', (e: any) => e.source.x).attr('y1', (e: any) => e.source.y).attr('x2', (e: any) => e.target.x).attr('y2', (e: any) => e.target.y);
      nodeSel.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
    });
  sim.alpha(1).restart();

  flyToFn = (nodeId: string): void => {
    const node = data.nodes.find(n => n.id === nodeId);
    if (!node) return;
    const x = node.x || 0, y = node.y || 0;
    svg.transition().duration(400).ease(d3.easeCubicInOut).call(zoom.transform, d3.zoomIdentity.translate(width / 2 - x, height / 2 - y).scale(1.5));
    setTimeout(() => openBuffer(node), 420);
  };

  window.addEventListener('resize', () => {
    sim.force('center', d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2) as any);
    sim.alpha(0.3).restart();
  });

}

// ====== BOOT ======

(async () => {
  const container = document.getElementById('graph-container');
  if (!container) return;

  document.fonts.ready.then(async () => {
    await document.fonts.load("14px 'JetBrains Mono'");

    try {
      const res = await fetch('/graph.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: GraphData = await res.json();
      mountGraph(container, data);
      console.log(`Graph loaded: ${data.nodes.length} nodes, ${data.edges.length} edges`);
    } catch (e: unknown) {
      console.error('Graph load error:', e);
      const errMsg = e instanceof Error ? e.message : String(e);
      container.innerHTML = `<p style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#FF2400;font-family:var(--font-mono)">Failed: ${errMsg}</p>`;
    }
  });
})();
