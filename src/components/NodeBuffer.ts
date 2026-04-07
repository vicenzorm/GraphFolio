import { marked } from 'marked';

export interface BufferNode {
  id: string;
  title: string;
  body: string;
}

const backdrop = document.createElement('div');
backdrop.setAttribute('class', 'node-buffer-backdrop');

const panel = document.createElement('div');
backdrop.appendChild(panel);

let currentOpen = false;
let onCloseCallback: (() => void) | null = null;

function renderBody(body: string): string {
  // Render wikilinks as styled spans
  const rendered = marked.parse(body, { async: false }) as string;
  return rendered.replace(
    /\[\[([^\]]+)\]\]/g,
    '<span class="wikilink">$1</span>'
  );
}

function openBuffer(node: BufferNode) {
  if (currentOpen) closeBuffer();

  // Build header
  const header = document.createElement('div');
  header.setAttribute('class', 'buffer-header');
  header.innerHTML = `
    <span class="buffer-title">${node.title}</span>
    <button class="buffer-close" aria-label="Close">Close</button>
  `;

  // Build body
  const body = document.createElement('div');
  body.setAttribute('class', 'buffer-body');
  body.innerHTML = renderBody(node.body);

  // Clear previous
  panel.innerHTML = '';
  panel.appendChild(header);
  panel.appendChild(body);

  // Close handler
  function close() {
    closeBuffer();
    if (onCloseCallback) {
      onCloseCallback();
    }
  }

  header.querySelector('.buffer-close')!.addEventListener('click', close)

  // Show
  document.body.appendChild(backdrop);
  currentOpen = true;

  // Request animation for entry
  requestAnimationFrame(() => {
    panel.classList.add('visible');
  });
}

function closeBuffer() {
  if (!currentOpen) return;
  currentOpen = false;
  panel.classList.remove('visible');
  setTimeout(() => {
    backdrop.remove();
  }, 130);
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && currentOpen) {
    e.preventDefault();
    closeBuffer();
    if (onCloseCallback) onCloseCallback();
  }
}
window.addEventListener('keydown', handleKeydown);

function onBackgroundClick(e:MouseEvent){
  if(e.target === backdrop){
    closeBuffer();
    if(onCloseCallback) onCloseCallback();
  }
}
backdrop.addEventListener('click', onBackgroundClick);

export function initBuffer(onClose?: () => void): void {
  onCloseCallback = onClose || null;
}

export { openBuffer, closeBuffer };
