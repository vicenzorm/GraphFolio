---
title: "SafeCons"
description: "Mensageiro privado offline-first para comunicação local segura via BLE."
---
# SafeCons

## App Store (prioridade)
- Ainda não publicado

## Por que este projeto está em destaque
SafeCons combina arquitetura de segurança, rede e UX de produto em uma solução iOS nativa coesa com profundidade técnica clara.

## Qual problema isso resolveu?
A maioria dos apps de mensagem depende de internet e servidores centralizados. SafeCons permite comunicação local criptografada sem Wi-Fi ou rede celular.

## Qual foi meu papel?
- Cargo: Criador e Desenvolvedor iOS
- Tamanho do time: 1
- Escopo: Arquitetura, criptografia, rede BLE, persistência e UI/UX

## O que eu construí especificamente
- Fluxos de geração de chave P256 e criptografia AES-GCM para mensagens em repouso e em trânsito
- Entrega de pacotes BLE com chunking dinâmico para troca offline confiável
- Troca de chaves via QR fora de banda para reduzir risco de MITM
- Arquitetura completa do app e interface ponta a ponta

## Impacto de negócio
- Segurança: remove dependência de servidores centrais para transporte de mensagens
- Conectividade: habilita mensagens locais totalmente offline via BLE
- Mitigação de risco: adiciona proteção contra replay e fluxo de troca de chaves mais seguro

## Como eu entreguei
- Decisões-chave: CoreBluetooth + CryptoKit + SwiftData para manter stack nativa e segura
- Trade-offs: priorizei garantias de segurança sobre alcance de conectividade e velocidade de onboarding
- Modelo de decisão: escolhas de produto guiadas por UX mínima e explícita para ações sensíveis à confiança

## Tecnologias usadas
- [[CoreBluetooth]]
- [[CryptoKit]]
- [[SwiftData]]
- [[SwiftUI]]
- [[VisionKit]]

## Categoria
- [[Personal Projects]]

## Links
- Repository: https://github.com/vicenzorm/safecons
