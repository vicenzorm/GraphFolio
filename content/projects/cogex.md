---
title: "CogeX"
type: project
description: "A local-first CLI that analyzes staged changes, generates Conventional Commits with local AI, and can split mixed diffs into atomic commits by context."
---
# CogeX

## App Store
- Not applicable

## What problem did this solve?
It solved two recurring Git workflow issues: vague commit messages (for example, `git commit -m "update"`) and the difficulty of splitting unrelated staged changes into clean, atomic commits. CogeX automates both steps with local AI, preserving full code privacy and low latency without external APIs.

## What was my role?
- Role title: Creator & Solo Developer
- Team size: 1
- Scope owned: CLI architecture, prompt engineering, core Bash implementation, and Git + Ollama integration

## What I specifically built
- Implemented: A pure shell-script CLI (no Python) using only `bash`, `curl`, and `jq`, with automatic Conventional Commit generation.
- Designed: An interactive terminal flow to accept (`y`), cancel (`n`), or edit (`e`) the suggested message in `$EDITOR` before the final commit.
- Optimized: A local-first pipeline tuned for fast small Ollama models, with `gemma4:e2b` as default and override support via `COGEX_MODEL`.
- Added: A Smart Splitting mechanism that detects distinct concerns in staged changes and groups files by subject for atomic commits.

## Business impact
- Commit quality: more consistent and auditable messages aligned with Conventional Commits (`feat`, `fix`, `docs`, etc.)
- Privacy: 100% local processing (no API keys and no cloud code upload)
- Developer productivity: less friction in versioning with semi-automated split suggestions for focused commits

## How I delivered
- Key decisions: strict Unix philosophy (do one thing and do it well), keeping the tool minimal and configurable via environment variables only (`COGEX_MODEL`, `COGEX_OLLAMA_URL`).
- Trade-offs: requires Ollama to be installed and running; in exchange, it delivers local control, operational simplicity, and minimal dependencies.
- Delivery model: MIT open-source distribution with simple Homebrew installation (`brew tap vicenzorm/tools && brew install cogex`).

## Tech used
- [[Bash]]
- [[Ollama]]
- [[Git]]
- [[jq]]
- [[curl]]

## Category
- [[Personal Projects]]

## Links
- Repository: https://github.com/vicenzorm/cogex
- Demo/Other: Homebrew install + local model setup (`ollama pull gemma4:e2b`)
