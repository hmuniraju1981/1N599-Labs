// =============================================================================
// FILE: src/components/three/index.ts
// PURPOSE: Barrel export for Three.js / 3D components.
//          These components use React Three Fiber and should be dynamically
//          imported with { ssr: false } since they require browser WebGL APIs.
// =============================================================================

export { default as ParticleField } from "./ParticleField"; // 3D neural network particles
