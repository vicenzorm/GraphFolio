---
title: "CogeX"
type: project
description: "Uma ferramenta CLI minimalista com IA local que gera mensagens de commit convencionais e agrupa alterações automaticamente."
---
# CogeX

## What problem did this solve?
Resolveu o problema da criação de mensagens de commit genéricas ou pouco descritivas (como o clássico `git commit -m "update"`) e o desafio de separar manualmente alterações de ficheiros em commits adequados. O CogeX elimina a fricção na documentação do código, garantindo que as mensagens seguem o padrão Conventional Commits. Além disso, resolve preocupações de privacidade e latência ao manter o processamento estritamente na máquina local através de modelos de linguagem de pequena dimensão, sem exposição de código proprietário a APIs externas.

## What was my role?
- Role title: Criador e Desenvolvedor Solo
- Team size: 1
- Scope owned: Arquitetura da ferramenta, engenharia de prompts, desenvolvimento integral do script em Bash e integração da CLI com o Git e a API do Ollama.

## What I specifically built
- Implemented: Um script robusto em Bash puro sem dependências em Python, recorrendo ao `curl` e ao `jq` para orquestrar a comunicação com a IA local. Criei uma funcionalidade de "Smart Splitting" que avalia se as alterações contêm contextos múltiplos e os agrupa em commits atómicos de forma inteligente.
- Designed: Um fluxo interativo diretamente no terminal que permite aos utilizadores aprovar (`y`), rejeitar (`n`) ou editar (`e`) as mensagens sugeridas de imediato.
- Optimized: Desempenho ultrarrápido ao configurar a ferramenta para tirar partido nativo de modelos pequenos e ágeis como o `qwen2.5-coder:1.5b`, definindo temperaturas baixas para respostas determinísticas e concisas.

## Business impact (most important)
- Metric 1: Mensagens desorganizadas → Commits perfeitamente alinhados com a norma Conventional Commits (feat, fix, docs, etc.).
- Metric 2: 100% de garantia de privacidade de código, eliminando riscos associados a fugas de dados em serviços na nuvem.
- Metric 3: Aumento substancial da produtividade do programador através da segmentação automatizada (Smart Splitting), poupando tempo na organização de _staging_ complexos.

## How I delivered
- Key decisions: Aplicação estrita da Filosofia Unix — fazer uma coisa e fazê-la bem. Optei por usar um script simples de shell configurável por variáveis de ambiente (`COGEX_MODEL`, `COGEX_OLLAMA_URL`), em vez de ficheiros de configuração pesados.
- Trade-offs: Dependência da execução prévia do Ollama em background. Privilegiou-se o processamento sem atritos em detrimento do suporte de base ("out-of-the-box") em ambientes sem requisitos de linha de comandos, mantendo o software extremamente leve.
- Communication and delivery model: Publicação de código aberto ao abrigo da Licença MIT, com um processo de instalação simples e direito via Homebrew.

## Tech used (short list)
- [[Shell Script (Bash)]]
- [[Ollama]] (LLMs Locais)
- [[Git]]
- [[jq]] e [[curl]]

## Category
- [[Personal Projects]]
- [[Open Source]]

## Links
- Repository: https://github.com/vicenzorm/cogex
- Demo/Other: Instalação via `brew install cogex`
