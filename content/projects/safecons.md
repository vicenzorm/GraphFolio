---
title: "SafeCons"
type: project
description: "An offline-first, zero-knowledge iOS messaging app built for extreme privacy via BLE and Secure Enclave."
---
# SafeCons

## What problem did this solve?
Standard messaging apps rely on centralized servers, phone numbers, and internet connectivity, making them vulnerable to data breaches and censorship. SafeCons solves this by providing a secure, 100% offline communication channel. It is designed for privacy-critical local meetings or off-grid environments, ensuring cryptographic keys never leave the device unless explicitly shared in person.

## What was my role?
- Role title: Creator & iOS Developer
- Team size: 1
- Scope owned: End-to-end development, including Cryptography, BLE Networking architecture, local persistence, and UI/UX.

## Business impact (most important)
- Security Metric: Eliminated reliance on central servers by generating P256 cryptographic key pairs locally within the hardware's Secure Enclave.
- Connectivity Metric: Enabled entirely offline messaging via CoreBluetooth (BLE Mesh), requiring no Wi-Fi or cellular data.
- Threat Mitigation: Prevented Man-In-The-Middle (MITM) attacks via physical out-of-band QR key exchanges, and neutralized replay attacks using dynamic timestamp injection before encryption.

## How I delivered
- Key decisions: Chose CoreBluetooth for peer-to-peer messaging, implementing custom dynamic MTU chunking to reliably send encrypted packets. Adopted a zero-knowledge architecture using SwiftData and AES-GCM to encrypt all messages at rest.
- Trade-offs: Sacrificed long-distance communication and onboarding convenience (requires physical VisionKit scanning for key exchange) to guarantee absolute security and prevent remote MITM attacks.
- Stakeholder communication: Followed the Unix philosophy ("do one thing well") to design a minimalist, terminal-inspired interface that transparently communicates the device's radio state and requires explicit user consent ("Intercom") for unknown handshakes.

## Tech used (short list)
- [[CoreBluetooth]] (BLE Mesh & MTU Chunking)
- [[CryptoKit]] & Security (P256, AES-GCM, Keychain)
- [[SwiftData]] (Zero-knowledge persistence)
- [[SwiftUI]] 
- [[VisionKit]] (Out-of-band QR exchanges)

## Links
- https://github.com/vicenzorm/safecons
