import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import matter from 'gray-matter';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'content');
const OUT_FILE = path.join(ROOT, 'public/graph.json');

function normalizeId(raw) {
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');
}

async function buildGraph() {
  const files = await fg('**/*.md', { cwd: CONTENT_DIR, absolute: true });

  if (files.length === 0) {
    console.warn('No Markdown files found in content/');
    const graphData = { nodes: [], edges: [] };
    await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
    await fs.writeFile(OUT_FILE, JSON.stringify(graphData, null, 2), 'utf-8');
    return;
  }

  const nodes = [];
  const byId = new Map();
  const wikilinkRe = /\[\[([^\]]+)\]\]/g;

  for (const file of files) {
    const raw = await fs.readFile(file, 'utf-8');
    const parsed = matter(raw);
    const filenameId = normalizeId(path.basename(file, '.md'));

    const id = normalizeId(parsed.data.slug ?? filenameId);
    const title = parsed.data.title ?? filenameId;
    const type = parsed.data.type ?? 'concept';
    const status = parsed.data.status ?? 'active';
    const year = parsed.data.year;
    const tags = Array.isArray(parsed.data.tags) ? parsed.data.tags : [];
    const description = parsed.data.description ?? '';
    const body = parsed.content.trim();

    // Extract wikilinks from body
    const linkTargets = new Set();
    let match;
    const re = new RegExp(wikilinkRe.source, 'g');
    while ((match = re.exec(body)) !== null) {
      linkTargets.add(normalizeId(match[1]));
    }

    // Tags are metadata only — edges come solely from actual wikilinks

    const node = {
      id, title, type, status, year, tags, description, body,
      _linkTargets: Array.from(linkTargets),
    };

    byId.set(id, node);
    nodes.push(node);
  }

  const edgesSet = new Set();
  const edges = [];
  const warnings = [];

  for (const node of nodes) {
    const linkTargets = node._linkTargets || [];
    for (const targetId of linkTargets) {
      if (!byId.has(targetId)) {
        warnings.push(`Unresolved wikilink in '${node.id}': '${targetId}'`);
        continue;
      }

      const key = [node.id, targetId].sort().join('::');
      if (edgesSet.has(key)) continue;
      edgesSet.add(key);
      edges.push({ source: node.id, target: targetId });
    }
  }

  // Clean up internal _linkTargets field
  const cleanNodes = nodes.map(n => {
    const { _linkTargets, ...rest } = n;
    return rest;
  });

  const graphData = { nodes: cleanNodes, edges };

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(graphData, null, 2), 'utf-8');

  if (warnings.length) {
    console.warn('\nWarnings:');
    for (const w of warnings) console.warn(`- ${w}`);
  }

  console.log(`Graph generated: ${path.relative(ROOT, OUT_FILE)}`);
  console.log(`Nodes: ${graphData.nodes.length} | Edges: ${graphData.edges.length}`);
}

// Run if called directly
buildGraph().catch((error) => {
  console.error(error);
  process.exit(1);
});
