---
title: "Shiro"
type: project
description: "A retro-inspired arcade climbing game built natively for iOS, simulating a classic portable console experience."
---
# Shiro

## What problem did this solve?
Modern mobile games often lack the tactile and nostalgic feel of classic arcade experiences. Shiro bridges this gap by delivering a fast-paced climbing game wrapped in a custom, fully functional virtual "GameBoy-style" console interface. It serves as a proof of concept for building scalable, high-performance 2D games purely using Apple's native frameworks, without relying on heavy third-party engines like Unity.

## What was my role?
- Role title: iOS/Game Developer
- Team size: 5
- Scope owned: End-to-end development, from SpriteKit physics engine tuning and GameplayKit state machines to Game Center integration and custom SwiftUI overlays.

## Business impact (most important)
- Engagement Metric: Integrated GameKit Leaderboards natively to drive player retention, repeatability, and a competitive core loop.
- Performance Metric: Maintained consistent 60 FPS rendering by optimizing SpriteKit nodes and leveraging efficient collision bitmasks for elements like obstacles and projectiles.
- Architecture Quality: Implemented a robust State Machine architecture (`GKStateMachine`) for complex player mechanics (Idle, Dash, Movement), completely decoupling movement logic from the main game loop and drastically reducing technical debt.

## How I delivered
- Key decisions: Decided to use SwiftUI for the overlay/console interface and HUD, seamlessly bridging it with a SpriteKit scene (`SKScene`) for the rendering engine. Built custom haptics and a centralized AudioManager to enhance the tactile "retro console" immersion.
- Trade-offs: Opted for SpriteKit over cross-platform engines. While this limits the game to the Apple ecosystem, it guaranteed zero-overhead access to native APIs like GameCenter, CoreHaptics, and SwiftUI, resulting in a much lighter binary and superior battery efficiency.
- Stakeholder communication: Adopted a highly modular structure (separating Nodes, States, and ViewModels), ensuring the codebase remains clean and extensible for future content updates or new game modes.

## Tech used (short list)
- [[SpriteKit]] (Physics engine & 2D Rendering)
- [[GameplayKit]] (State Machines for character behaviors)
- [[SwiftUI]] (Virtual console UI & MVVM bridging)
- [[GameKit]] (Leaderboards & Authentication)
- [[CoreHaptics]] & AVFoundation (Audio and tactile feedback)

## Links
- https://apps.apple.com/us/app/shiro/id6752502968
- https://github.com/vicenzorm/SaguBoy#
- https://www.linkedin.com/in/bernardofens/
- https://www.linkedin.com/in/pedro-kosciuk-lima-a29855207/
- https://www.linkedin.com/in/jeanpierrerodrigues/
- https://www.linkedin.com/in/enzotonatto/
