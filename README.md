# ◈ GraphFolio

> A living knowledge graph rendered as a portfolio. Not a website about me — a website *that thinks* like me.

Built with the conviction that a personal site should reflect how its author actually organizes knowledge: relational, non-hierarchical, and driven by plain text. Every node is a Markdown file. Every edge is a `[[wikilink]]`. The graph builds itself.

---

## Philosophy

> *"Write programs that do one thing well. Write programs that work together. Write programs that handle text streams."*

This site is that philosophy applied to a portfolio:

- **Text is the source of truth.** Content lives in `.md` files — no database, no CMS, no admin panel.
- **The build pipeline is the transformation.** `[[wikilinks]]` become graph edges at build time.
- **The interface is the message.** The graph communicates technical identity before a single node is opened.

---

## Stack

| Layer | Tool | Why |
|---|---|---|
| Framework | [Astro](https://astro.build) | Static-first, markdown-native, zero JS by default |
| Graph | [D3.js v7](https://d3js.org) | Full control over force simulation, SVG, and animations |
| Search | [Fuse.js](https://fusejs.io) | Client-side fuzzy search, no server required |
| Language | TypeScript | Throughout |
| Frontmatter | gray-matter | YAML parsing at build time |
| Fonts | JetBrains Mono | Monospace |

---

## How it works

```
content/**/*.md
      │
      ▼
scripts/build-graph.mjs       ← parses frontmatter + [[wikilinks]]
      │
      ▼
public/graph.json              ← nodes + edges, generated at build time
      │
      ▼
D3.js force simulation         ← renders the 2D graph in the browser
```

Adding content is dropping a file:

```bash
# add a new project
touch content/projects/my-new-project.md
# write frontmatter + body + [[wikilinks]]
# run dev server — new node appears automatically
npm run dev
```

---

## Content schema

Every `.md` file in `content/` becomes a node:

```yaml
---
title:       My Project
type:        project          # project | skill | language | concept | social | about
year:        2025
tags:        [rust, cli, tui]
description: One-line summary shown on hover.
url:                          # optional — for social nodes, opens in new tab on click
---

Body text here. Use [[wikilinks]] to connect to other nodes.
Every [[link]] becomes an edge in the graph.
```

Node types map to visual sizes:

| Type | Radius | Color |
|---|---|---|
| `project` | 18px | `#7c6af7` purple |
| `skill` / `language` | 10px | `#4fc3f7` cyan |
| `concept` | 7px | `#6abf69` green |
| `social` | 10px | `#ff4d8d` pink |
| `about` | 18px | `#f5f5f0` off-white |

---

## Getting started

```bash
# clone
git clone https://github.com/yourusername/graph-folio
cd graph-folio

# install
npm install

# develop
npm run dev       # generates graph.json + starts dev server at localhost:4321

# build
npm run build     # generates graph.json + outputs static site to dist/
```

---

## Keyboard navigation

| Key | Action |
|---|---|
| `Cmd+K` | Open global search |
| `Ctrl+N` / `Ctrl+K` | Navigate search results |
| `Enter` | Fly to node + open details |
| `Escape` | Close any open overlay |
| `:q` | Close node buffer (yes, really) |
| Scroll | Zoom in/out (0.3× – 3×) |
| Drag canvas | Pan |
| Drag node | Reposition |

---

## Project structure

```
graph-folio/
├── content/                  # source of truth — edit these
│   ├── about/
│   ├── projects/
│   ├── skills/
│   ├── concepts/
│   └── social/
├── scripts/
│   └── build-graph.mjs       # content parser — do not edit unless extending schema
├── public/
│   └── graph.json            # generated — do not commit
├── src/
│   ├── pages/index.astro
│   ├── styles/tokens.css
│   └── components/
│       ├── GraphCanvas.ts
│       ├── NodeBuffer.ts
│       └── OmniSearch.ts
└── astro.config.mjs
```

---

## Scaling

The site is designed to grow without friction:

- No config changes needed when adding new nodes
- `graph.json` is loaded once by the browser and kept in memory for search
- For graphs over 200 nodes, switch the D3 renderer from SVG to Canvas (see `GraphCanvas.ts`)
- New `type` values in frontmatter auto-register new visual classes
