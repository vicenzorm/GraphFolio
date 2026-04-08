import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import matter from 'gray-matter';

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

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
  const files = await fg('**/*.md', {
    cwd: CONTENT_DIR,
    absolute: true,
    ignore: ['templates/**', '**/_TEMPLATE-*.md', '**/*TEMPLATE*.md', '**/*.pt.md'],
  });

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

    const rawType = String(parsed.data.type ?? 'concept').trim().toLowerCase();
    const TYPE_ALIASES = {
      skill: 'technology',
      language: 'technology',
      framework: 'technology',
      tool: 'technology',
      database: 'technology',
      certification: 'experience',
      certifications: 'experience',
    };
    const type = TYPE_ALIASES[rawType] ?? rawType;

    const year = parsed.data.year;
    const description = parsed.data.description ?? '';
    const url = typeof parsed.data.url === 'string' ? parsed.data.url.trim() : '';
    const body = parsed.content.trim();

    const ptFile = file.replace(/\.md$/i, '.pt.md');
    let titlePt = '';
    let descriptionPt = '';
    let bodyPt = '';
    if (await fileExists(ptFile)) {
      const rawPt = await fs.readFile(ptFile, 'utf-8');
      const parsedPt = matter(rawPt);
      titlePt = String(parsedPt.data.title ?? '').trim();
      descriptionPt = String(parsedPt.data.description ?? '').trim();
      bodyPt = parsedPt.content.trim();
    }

    // Extract wikilinks from body
    const linkTargets = new Set();
    let match;
    const re = new RegExp(wikilinkRe.source, 'g');
    while ((match = re.exec(body)) !== null) {
      linkTargets.add(normalizeId(match[1]));
    }

    const node = {
      id, title, type, year, description, url, body,
      title_pt: titlePt,
      description_pt: descriptionPt,
      body_pt: bodyPt,
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
