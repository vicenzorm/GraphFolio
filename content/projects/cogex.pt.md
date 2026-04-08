---
title: "CogeX"
type: project
description: "Uma CLI local-first que analisa staged changes, gera Conventional Commits com IA local e pode dividir alterações em commits atómicos por contexto."
---
# CogeX

## What problem did this solve?
Resolveu dois problemas recorrentes no fluxo com Git: mensagens vagas (ex.: `git commit -m "update"`) e dificuldade de separar alterações não relacionadas em commits limpos. O CogeX automatiza ambas as etapas com IA local, mantendo privacidade total do código e baixa latência, sem dependência de APIs externas.

## What was my role?
- Role title: Criador e Desenvolvedor Solo
- Team size: 1
- Scope owned: Arquitetura da CLI, engenharia de prompts, implementação do core em Bash e integração com Git + Ollama.

## What I specifically built
- Implemented: Ferramenta em shell script puro (sem Python), usando apenas `bash`, `curl` e `jq`, com geração automática de mensagens no padrão Conventional Commits.
- Designed: Fluxo interativo no terminal para aceitar (`y`), cancelar (`n`) ou editar (`e`) a sugestão no `$EDITOR` antes do commit final.
- Optimized: Pipeline local-first otimizado para modelos leves e rápidos no Ollama, com default `gemma4:e2b` e suporte a override via `COGEX_MODEL`.
- Added: Mecanismo de Smart Splitting que detecta contextos distintos nas mudanças staged e agrupa ficheiros por assunto para criar commits atómicos.

## Business impact (most important)
- Metric 1: Mensagens de commit mais consistentes e auditáveis, aderentes ao padrão Conventional Commits (`feat`, `fix`, `docs`, etc.).
- Metric 2: Privacidade de código preservada (processamento 100% local, sem API key e sem envio para cloud).
- Metric 3: Redução de fricção no fluxo de versionamento com separação semiautomática de alterações em commits focados.

## How I delivered
- Key decisions: Aplicação da Filosofia Unix (fazer uma coisa e fazê-la bem), mantendo a solução minimalista e configurável apenas por variáveis de ambiente (`COGEX_MODEL`, `COGEX_OLLAMA_URL`).
- Trade-offs: Requer Ollama instalado e em execução prévia; em troca, entrega controlo local, simplicidade operacional e dependências mínimas.
- Communication and delivery model: Distribuição open source sob MIT e instalação simplificada via Homebrew (`brew tap vicenzorm/tools && brew install cogex`).

## Tech used (short list)
- [[Bash]]
- [[Ollama]]
- [[Git]]
- [[jq]]
- [[curl]]

## Category
- [[Personal Projects]]
- [[Open Source]]

## Links
- Repository: https://github.com/vicenzorm/cogex
- Demo/Other: Instalação via Homebrew + modelo local (`ollama pull gemma4:e2b`)
