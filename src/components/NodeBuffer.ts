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
let cmdSheetVisible = false;

// Command sheet
const cmdSheet = document.createElement('div');
cmdSheet.className = 'cmd-sheet';
cmdSheet.innerHTML = `
  <div class="cmd-sheet-inner">
    <div class="cmd-line"><span class="cmd-prompt">:</span><input class="cmd-input" type="text" placeholder="comando..." autocomplete="off" /></div>
    <div class="cmd-hints">
      <span><kbd>q</kbd> fechar buffer</span>
      <span><kbd>Esc</kbd> cancelar</span>
    </div>
  </div>
`;

function openCmdSheet() {
  if (cmdSheetVisible) return;
  cmdSheetVisible = true;
  document.body.appendChild(cmdSheet);
  requestAnimationFrame(() => cmdSheet.classList.add('visible'));
  const input = cmdSheet.querySelector('.cmd-input') as HTMLInputElement;
  input?.focus();
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      e.preventDefault();
      closeCmdSheet();
      if (e.key === 'Enter' && (input as HTMLInputElement).value.trim() === 'q') {
        closeBuffer();
      }
    }
  });
}

function closeCmdSheet() {
  cmdSheetVisible = false;
  cmdSheet.classList.remove('visible');
  setTimeout(() => cmdSheet.remove(), 120);
}

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
    <button class="buffer-close" aria-label="Close">:q</button>
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

  // Press ':' to open command sheet
  const onCmdKey = (e: KeyboardEvent) => {
    if (currentOpen && e.key === ':' && !cmdSheetVisible) {
      e.preventDefault()
      openCmdSheet()
    }
  }
  document.addEventListener('keydown', onCmdKey);

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
  closeCmdSheet();
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
