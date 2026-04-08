---
title: "SafeCons"
type: project
description: "Offline-first private messenger for secure local communication over BLE."
---
# SafeCons

## App Store (priority)
- Not published yet

## Why this is featured
SafeCons combines security architecture, networking, and product UX in one cohesive native iOS solution with clear technical depth.

## What problem did this solve?
Most messaging apps depend on internet and centralized servers. SafeCons enables local, encrypted communication without Wi-Fi or cellular networks.

## What was my role?
- Role title: Creator & iOS Developer
- Team size: 1
- Scope owned: Architecture, cryptography, BLE networking, persistence, and UI/UX

## What I specifically built
- Implemented P256 key generation and AES-GCM encryption flows for messages at rest and in transit
- Built BLE packet delivery with dynamic chunking for reliable offline exchange
- Designed QR-based out-of-band key exchange to reduce MITM risk
- Delivered the full app architecture and interface end-to-end

## Business impact (most important)
- Security: Removed dependence on central servers for message transport
- Connectivity: Enabled fully offline local messaging via BLE
- Risk mitigation: Added replay protection and safer key exchange flow

## How I delivered
- Key decisions: CoreBluetooth + CryptoKit + SwiftData to keep the stack native and secure
- Trade-offs: Prioritized security guarantees over long-range connectivity and onboarding speed
- Communication model: Product decisions driven by a minimal, explicit UX for trust-critical actions

## Tech used 
- [[CoreBluetooth]]
- [[CryptoKit]]
- [[SwiftData]]
- [[SwiftUI]]
- [[VisionKit]]

## Category
- [[Personal Projects]]

## Links
- Repository: https://github.com/vicenzorm/safecons
