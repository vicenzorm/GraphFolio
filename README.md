# ◈ GraphFolio

A portfolio rendered as a knowledge graph.

Each Markdown file is a node. Each `[[wikilink]]` is an edge. The graph is generated at build time and rendered client-side.

---

## Stack

- Astro 5
- D3.js v7
- Fuse.js
- gray-matter
- marked
- TypeScript

---

## Core ideas

- Markdown is the source of truth (`content/**`).
- No CMS, no database, no backend.
- `scripts/build-graph.mjs` parses frontmatter + wikilinks and writes `public/graph.json`.
- UI supports two modes:
  - Graph Mode (interactive graph)
  - Simple Mode (direct sectioned reading)
- UI supports EN/PT-BR toggle with persistent preference.

---

## How data flows

```text
content/**/*.md (+ optional .pt.md sidecars)
            │
            ▼
scripts/build-graph.mjs
            │
            ▼
public/graph.json
            │
            ▼
src/pages/index.astro (D3 + search + buffers)
```

---

## Content model

Every `content/**/*.md` file (except templates and `*.pt.md`) becomes a node.

Minimum frontmatter:

```yaml
---
title: "Node title"
type: project
description: "Short hover/summary text"
---
```

Optional fields:

- `slug`: custom stable ID for wikilink resolution
- `year`: optional metadata (used mainly for experience timeline context)
- `url`: external link target (common for social nodes)

Body supports wikilinks:

```md
Built with [[Astro]], [[D3JS]], and [[TypeScript]].
```

Each `[[...]]` creates an undirected edge if the target node exists.

---

## Supported node types

Common types used in this project:

- `about`
- `featured`
- `project`
- `personal-project`
- `technology`
- `experience`
- `social`

Aliases normalized by parser:

- `skill`, `language`, `framework`, `tool`, `database` → `technology`
- `certification`, `certifications` → `experience`

---

## Bilingual content (EN/PT-BR)

Primary file: `name.md`

Optional Portuguese sidecar: `name.pt.md`

Example:

- `content/projects/cogex.md`
- `content/projects/cogex.pt.md`

At build time, sidecar content is merged into node fields:

- `title_pt`
- `description_pt`
- `body_pt`

If `.pt.md` is missing, UI falls back to English.

---

## Project structure

```text
site/
├── content/
│   ├── about/
│   ├── concepts/
│   ├── experience/
│   ├── featured/
│   ├── projects/
│   ├── social/
│   ├── technologies/
│   └── templates/
├── public/
│   └── graph.json                # generated
├── scripts/
│   └── build-graph.mjs
├── src/
│   ├── components/
│   ├── pages/
│   │   └── index.astro
│   ├── scripts/
│   └── styles/
├── package.json
└── astro.config.mjs
```

---

## Getting started

```bash
npm install
npm run dev
```

Dev server runs on Astro default (`http://localhost:4321`).

Build production output:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

---

## Content workflow

1) Create a node in the right folder (for example `content/projects/my-project.md`).
2) Add frontmatter (`title`, `type`, `description`).
3) Write body and connect with `[[Wikilinks]]`.
4) (Optional) add `my-project.pt.md` translation.
5) Run `npm run build` and check warnings.

---

## Troubleshooting

- Warning: `Unresolved wikilink in 'x': 'y'`
  - Fix the target node filename/slug/title link consistency.
- Warning about `src/content/nodes/` from Astro glob loader
  - Non-blocking for this graph pipeline; current graph build still works.

