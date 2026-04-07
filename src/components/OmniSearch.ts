import Fuse from 'fuse.js';

export interface SearchNode {
  id: string;
  title: string;
  type: string;
  tags: string[];
  description: string;
  body: string;
}

const TYPE_COLORS: Record<string, string> = {
  project: '#0087BD',
  technology: '#009F6B',
  concept: '#FFD700',
  social: '#FF1493',
  experience: '#C40233',
};

const backdrop = document.createElement('div');
backdrop.setAttribute('class', 'omni-backdrop');

const container = document.createElement('div');
backdrop.appendChild(container);

let fuse: Fuse<SearchNode> | null = null;
let results: SearchNode[] = [];
let selectedIndex = 0;
let onEnter: ((nodeId: string) => void) | null = null;
let isOpen = false;

function getTypeBadge(type: string): string {
  const color = TYPE_COLORS[type] || '#696969';
  return `<span class="omni-badge" style="background:${color}22;color:${color};border:1px solid ${color}55">${type.toUpperCase()}</span>`;
}

function renderResults() {
  const listEl = container.querySelector('.omni-results') as HTMLElement;
  if (!listEl) return;

  if (results.length === 0) {
    listEl.innerHTML = '<div class="omni-empty">No matches found.</div>';
    return;
  }

  listEl.innerHTML = results.map((node, i) => `
    <div class="omni-result ${i === selectedIndex ? 'active' : ''}" data-index="${i}">
      ${getTypeBadge(node.type)}
      <span class="omni-result-title">${node.title}</span>
      ${node.description ? `<span class="omni-result-desc"> — ${node.description}</span>` : ''}
    </div>
  `).join('');

  listEl.querySelectorAll('.omni-result').forEach((el, i) => {
    el.addEventListener('click', () => {
      if (results[i]) {
        onEnter?.(results[i].id);
      }
    });
  });
}

function open(nodes: SearchNode[]) {
  if (isOpen) return;
  isOpen = true;
  selectedIndex = 0;

  // Init Fuse.js
  fuse = new Fuse(nodes, {
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'tags', weight: 0.5 },
      { name: 'description', weight: 0.4 },
      { name: 'body', weight: 0.2 },
    ],
    threshold: 0.35,
    includeMatches: false,
  });

  results = nodes.slice(0, 15);

  container.innerHTML = `
    <input class="omni-input" type="text" placeholder="Search nodes..." autocomplete="off" />
    <div class="omni-results"></div>
    <div class="omni-footer">
      <span>Enter: open</span>
      <span>↑↓ / Ctrl+N/P: navigate</span>
      <span>Esc: close</span>
    </div>
  `;

  document.body.appendChild(backdrop);

  requestAnimationFrame(() => {
    container.classList.add('visible');
  });

  const input = container.querySelector('.omni-input') as HTMLInputElement;
  input?.focus();

  input?.addEventListener('input', () => {
    const q = input.value.trim();
    if (!q || !fuse) {
      results = nodes.slice(0, 15);
    } else {
      const r = fuse.search(q);
      results = r.slice(0, 15).map(f => f.item);
    }
    selectedIndex = 0;
    renderResults();
  });

  renderResults();
}

function close() {
  if (!isOpen) return;
  isOpen = false;
  container.classList.remove('visible');
  setTimeout(() => {
    backdrop.remove();
    container.innerHTML = '';
  }, 130);
}

function handleKeydown(e: KeyboardEvent) {
  const cmdOrCtrl = e.metaKey || e.ctrlKey;

  // Cmd/Ctrl+K to open
  if (!isOpen && cmdOrCtrl && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    return; // handled by the page-level listener
  }

  if (!isOpen) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    close();
    return;
  }

  // Ctrl+N / ArrowDown -> next
  if (e.key === 'ArrowDown' || (e.ctrlKey && e.key.toLowerCase() === 'n')) {
    e.preventDefault();
    selectedIndex = (selectedIndex + 1) % results.length;
    renderResults();
    return;
  }

  // Ctrl+P / ArrowUp -> previous
  if (e.key === 'ArrowUp' || (e.ctrlKey && e.key.toLowerCase() === 'p')) {
    e.preventDefault();
    selectedIndex = (selectedIndex - 1 + results.length) % results.length;
    renderResults();
    return;
  }

  // Enter -> select
  if (e.key === 'Enter') {
    e.preventDefault();
    if (results[selectedIndex]) {
      onEnter?.(results[selectedIndex].id);
    }
  }
}
window.addEventListener('keydown', handleKeydown);

export function initOmniSearch(onSelect: (nodeId: string) => void): void {
  onEnter = onSelect;
}

export { open, close, isOpen as getIsOpen };
