---
title: "Glyptis"
type: project
description: "An AR spatial computing app for creating and placing 3D voxel sculptures in the real world."
---
# Glyptis

## What problem did this solve?
Digital art often feels disconnected from our physical surroundings. Glyptis bridges this gap by providing a spatial computing platform where users can construct 3D voxel sculptures and anchor them in their physical environment using Augmented Reality. It essentially turns the real world into an interactive digital museum.

## What was my role?
- Role title: iOS/AR Developer
- Team size: 5
- Scope owned: 3D Canvas architecture, AR rendering (ARKit), data persistence (SwiftData), and state management bridging SwiftUI and SceneKit/RealityKit.

## Business impact 
- Architecture Metric: Designed a robust `UnifiedCoordinator` pattern to seamlessly bridge declarative SwiftUI overlays with the complex gesture recognizers, camera logic, and hit-testing required by the imperative 3D/AR environment.
- Performance Metric: Optimized the real-time rendering of complex voxel structures, ensuring a stable frame rate during the sculpture creation process in the Canvas and its physical placement in the AR view.
- Data Metric: Implemented a highly relational local persistence layer using `SwiftData`, effectively structuring the hierarchy between `Sculpture`, `Cube`, and `Author` models to prevent data loss during intensive creation sessions.

## How I delivered
- Key decisions: Chose a voxel-based (cube) modeling approach to lower the barrier to entry for users and maintain predictable rendering performance in AR. Completely decoupled the 3D modeling environment (`Canvas3D`) from the AR visualization (`ARCameraView`) to keep the modules scalable and testable.
- Trade-offs: Prioritized a rock-solid offline-first architecture with SwiftData before integrating cloud synchronization (CloudKit), guaranteeing that users never lose hours of 3D modeling work due to network instability.
- Stakeholder communication: Collaborated closely with the design team to implement a non-intrusive, glass-morphic UI (`GlassCardView`, custom Hexagon color pickers) that provides powerful tools without obstructing the user's camera feed or breaking immersion.

## Tech used 
- [[ARKit]] 
- [[SceneKit]] 
- [[RealityKit]] 
- [[SwiftData]] 
- [[SwiftUI]] 

## Links
- https://apps.apple.com/us/app/glyptis-realidade-esculpida/id6755839447
- https://github.com/camana98/appChallenge3
- https://www.linkedin.com/in/pablogarciadev/
- https://www.linkedin.com/in/eduardocamana/
- https://www.linkedin.com/in/giovana-diesel/
- https://www.linkedin.com/in/guilhermeghise/
