---
title: "Zenith: The Endless Tower"
type: project
description: "A top-down roguelike game natively built for iOS using a scalable Entity-Component-System (ECS) architecture."
---
# Zenith: The Endless Tower

## What problem did this solve?
Developing a scalable roguelike game requires handling dozens of simultaneous entities, complex physics, and dynamic state changes. Relying on traditional object-oriented inheritance quickly leads to rigid, unmaintainable code. Zenith solves this by implementing a robust Entity-Component-System (ECS) architecture natively on iOS, proving that high-performance, dynamic games can be built without relying on heavy third-party engines like Unity.

## What was my role?
- Role title: iOS/Game Developer
- Team size: 5
- Scope owned: Game design, ECS architecture implementation, SpriteKit rendering optimization, Enemy AI systems, and GameCenter integration.

## Business impact (most important)
- Architecture Quality: Built a fully decoupled ECS engine (with dedicated Movement, Attack, Wave, and AI Systems), completely separating game data from rendering logic, which drastically reduces technical debt.
- Scalability Metric: Implemented a dynamic `WaveSystem` that procedurally manages enemy spawning and increasing difficulty, ensuring endless replayability with minimal manual level design overhead.
- Engagement Metric: Integrated `GameKit` natively to drive player retention through high-score competition and leaderboards, alongside custom haptics for tactile feedback.

## How I delivered
- Key decisions: Chose the ECS paradigm over deep inheritance hierarchies. Created an `EntityFactory` to rapidly spawn complex characters (enemies, projectiles, items) by composing reusable behaviors (e.g., `HealthComponent`, `MovementComponent`).
- Trade-offs: Accepted a steeper initial architectural setup time to build the core systems and a custom `FloatingJoystick` from scratch, instead of using simpler out-of-the-box solutions. This paid off immensely in long-term maintainability and precise input control.
- Stakeholder communication: Maintained a strict separation of concerns, ensuring that SwiftUI overlay menus (like the Onboarding and Pause views) communicate seamlessly with the core SpriteKit `GameScene` without tightly coupling the presentation layer to the game logic.

## Tech used (short list)
- [[SpriteKit]] (2D Rendering & Physics Engine)
- [[GameKit]] (GameCenter Leaderboards)
- [[CoreHaptics]] (Immersive tactile and sound feedback)

## Links
- https://github.com/vicenzorm/Zenyth
- https://www.linkedin.com/in/v%C3%ADtor-martins-940576207/
- https://www.linkedin.com/in/bernardofens/
- https://www.linkedin.com/in/lorenzo-fortes-573666174/
- https://www.linkedin.com/in/leonelhernandezs/
