import * as d3 from 'd3';

export interface GraphNode {
  id: string;
  title: string;
  type: string;
  status: string;
  year?: number;
  tags: string[];
  description: string;
  body: string;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type OnNodeClick = (nodeId: string) => void;

const NODE_COLORS: Record<string, string> = {
  project: '#7c6af7',
  skill: '#4fc3f7',
  language: '#4fc3f7',
  concept: '#6abf69',
};

const NODE_RADIUSES: Record<string, number> = {
  project: 18,
  skill: 10,
  language: 10,
  concept: 7,
};

export function mountGraph(
  container: HTMLElement,
  data: GraphData,
  onNodeClick: OnNodeClick,
  onNodeHover: (node: GraphNode | null) => void
): { flyToNode: (nodeId: string) => void; destroy: () => void } {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Tooltip element
  const tooltip = document.createElement('div');
  tooltip.setAttribute('class', 'graph-tooltip');
  document.body.appendChild(tooltip);

  // SVG
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('width', '100%')
    .style('height', '100%');

  // Zoom group
  const g = svg.append('g');

  // Zoom behavior
  const zoom = d3.zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.3, 3])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoom);

  // Defs for glow filter
  const defs = svg.append('defs');
  const filter = defs.append('filter').attr('id', 'glow');
  filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
  const feMerge = filter.append('feMerge');
  feMerge.append('feMergeNode').attr('in', 'coloredBlur');
  feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

  // Edges
  const edges = g.append('g')
    .attr('class', 'edges')
    .selectAll<SVGLineElement, GraphEdge>('line')
    .data(data.edges)
    .join('line')
    .attr('stroke', '#2a2a2a')
    .attr('stroke-opacity', 0.4)
    .attr('stroke-width', 1);

  // Node groups
  const nodeGroups = g.append('g')
    .attr('class', 'nodes')
    .selectAll<SVGGElement, GraphNode>('g')
    .data(data.nodes)
    .join('g')
    .attr('cursor', 'pointer');

  // Node circles
  nodeGroups.append('circle')
    .attr('r', (d) => NODE_RADIUSES[d.type] || 10)
    .attr('fill', (d) => NODE_COLORS[d.type] || NODE_COLORS.concept)
    .attr('stroke', 'rgba(255,255,255,0.1)')
    .attr('stroke-width', 1);

  // Node labels
  nodeGroups.append('text')
    .text((d) => d.title)
    .attr('text-anchor', 'middle')
    .attr('dy', (d) => (NODE_RADIUSES[d.type] || 10) + 14)
    .attr('fill', '#e0e0e0')
    .attr('font-size', (d) => {
      const r = NODE_RADIUSES[d.type] || 10;
      return r >= 18 ? '11px' : r >= 10 ? '9px' : '7px';
    })
    .attr('font-family', "'JetBrains Mono', monospace")
    .attr('pointer-events', 'none')
    .style('text-shadow', '0 0 6px rgba(0,0,0,0.9)');

  // Adjacency map
  const adjacency: Map<string, Set<string>> = new Map();
  for (const edge of data.edges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, new Set());
    if (!adjacency.has(edge.target)) adjacency.set(edge.target, new Set());
    adjacency.get(edge.source)!.add(edge.target);
    adjacency.get(edge.target)!.add(edge.source);
  }

  // Hover
  nodeGroups.on('mouseover', function (event, d) {
    const connected = adjacency.get(d.id) || new Set();
    const nodeId = d.id;

    // Scale this node
    d3.select(this).select('circle')
      .transition().duration(100)
      .attr('transform', 'scale(1.6)');

    // Show tooltip
    tooltip.innerHTML = `<strong>${d.title}</strong><br>${d.description || ''}`;
    tooltip.style.left = (event.pageX + 16) + 'px';
    tooltip.style.top = (event.pageY - 12) + 'px';
    tooltip.classList.add('visible');

    // Highlight connected, dim others
    nodeGroups.transition().duration(100)
      .attr('opacity', (n: GraphNode) => (n.id === nodeId || connected.has(n.id)) ? 1 : 0.15);

    edges.transition().duration(100)
      .attr('stroke-opacity', (e: GraphEdge) => {
        // d3 turns edge source/target into objects during simulation
        const src = typeof e.source === 'string' ? e.source : (e.source as any).id;
        const tgt = typeof e.target === 'string' ? e.target : (e.target as any).id;
        return (src === nodeId || tgt === nodeId) ? 1 : 0.06;
      })
      .attr('stroke', (e: GraphEdge) => {
        const src = typeof e.source === 'string' ? e.source : (e.source as any).id;
        const tgt = typeof e.target === 'string' ? e.target : (e.target as any).id;
        return (src === nodeId || tgt === nodeId) ? NODE_COLORS[d.type] || '#7c6af7' : '#2a2a2a';
      });

    onNodeHover(d);
  })
  .on('mousemove', function (event) {
    tooltip.style.left = (event.pageX + 16) + 'px';
    tooltip.style.top = (event.pageY - 12) + 'px';
  })
  .on('mouseout', function () {
    d3.select(this).select('circle')
      .transition().duration(200)
      .attr('transform', 'scale(1)');

    tooltip.classList.remove('visible');

    nodeGroups.transition().duration(200).attr('opacity', 1);
    edges.transition().duration(200)
      .attr('stroke-opacity', 0.4)
      .attr('stroke', '#2a2a2a');

    onNodeHover(null);
  });

  // Click
  nodeGroups.on('click', function (event, d) {
    event.stopPropagation();
    onNodeClick(d.id);
  });

  // Drag
  const drag = d3.drag<SVGGElement, GraphNode>()
    .on('start', function (event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on('drag', function (event, d) {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on('end', function (event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });

  nodeGroups.call(drag);

  // Pan on background
  svg.on('click', function (event) {
    if (event.target === svg.node()) {
      // click on empty space — do nothing
    }
  });

  // Force simulation
  const simulation = d3.forceSimulation<GraphNode>(data.nodes as any)
    .force('charge', d3.forceManyBody().strength(-200))
    .force('link', d3.forceLink<GraphNode, GraphEdge>(data.edges).id(d => d.id).distance(80))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide<GraphNode>().radius(d => (NODE_RADIUSES[d.type] || 10) + 4))
    .on('tick', () => {
      edges
        .attr('x1', (e: GraphEdge) => ((e.source as any).x || 0))
        .attr('y1', (e: GraphEdge) => ((e.source as any).y || 0))
        .attr('x2', (e: GraphEdge) => ((e.target as any).x || 0))
        .attr('y2', (e: GraphEdge) => ((e.target as any).y || 0));

      nodeGroups.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

  // Entry animation: high alpha, nodes fly from center
  simulation.alpha(1).restart();

  // flyToNode
  function flyToNode(nodeId: string): void {
    const node = data.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const x = node.x || 0;
    const y = node.y || 0;

    svg.transition()
      .duration(400)
      .ease(d3.easeCubicInOut)
      .call(zoom.transform, d3.zoomIdentity.translate(width / 2 - x, height / 2 - y).scale(1.5));

    // After zoom, open buffer
    setTimeout(() => onNodeClick(nodeId), 420);
  }

  // Resize
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    svg.attr('width', w).attr('height', h);
    simulation.force('center', d3.forceCenter(w / 2, h / 2) as any);
    simulation.alpha(0.3).restart();
  }
  window.addEventListener('resize', onResize);

  function destroy() {
    window.removeEventListener('resize', onResize);
    simulation.stop();
    d3.select(container).selectAll('*').remove();
    tooltip.remove();
  }

  return { flyToNode, destroy };
}
