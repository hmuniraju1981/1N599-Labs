// =============================================================================
// FILE: src/components/three/ParticleField.tsx
// PURPOSE: Renders a 3D scene with floating particles and a neural network
//          visualization using React Three Fiber (R3F) and Three.js.
//          This creates the immersive hero background effect.
//          It is loaded dynamically (no SSR) since WebGL requires a browser.
// =============================================================================

"use client"; // Must run on the client — WebGL/Canvas APIs are browser-only

import { useRef, useMemo } from "react";         // React hooks for refs and memoization
import { Canvas, useFrame } from "@react-three/fiber"; // R3F: React renderer for Three.js
import * as THREE from "three";                   // Three.js core library
import { COLORS } from "@/lib/constants";         // Color constants for particles

// =============================================================================
// PARTICLES SUB-COMPONENT
// Renders 800 colored points (particles) that slowly rotate in 3D space.
// Points are randomly distributed in a 20x20x20 unit cube.
// =============================================================================
function Particles() {
  // Ref to the Three.js Points object for animation frame updates
  const mesh = useRef<THREE.Points>(null);

  // Total number of particles to render
  const count = 800;

  // useMemo: Compute positions and colors once (not on every render)
  // Returns [Float32Array positions, Float32Array colors]
  const [positions, colors] = useMemo(() => {
    // Each particle needs 3 floats (x, y, z) — total: count * 3
    const positions = new Float32Array(count * 3);
    // Each particle needs 3 floats for RGB color — total: count * 3
    const colors = new Float32Array(count * 3);

    // Loop through each particle and assign random position + color
    for (let i = 0; i < count; i++) {
      // Random position in range [-10, 10] for each axis
      positions[i * 3] = (Math.random() - 0.5) * 20;     // X coordinate
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20; // Y coordinate
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20; // Z coordinate

      // Randomly assign one of three brand colors (cyan, violet, pink)
      const colorChoice = Math.random(); // Random value between 0-1
      if (colorChoice < 0.33) {
        // Cyan particles (RGB normalized to 0-1 range)
        colors[i * 3] = 0.024;     // R
        colors[i * 3 + 1] = 0.714; // G
        colors[i * 3 + 2] = 0.831; // B
      } else if (colorChoice < 0.66) {
        // Violet particles
        colors[i * 3] = 0.545;     // R
        colors[i * 3 + 1] = 0.361; // G
        colors[i * 3 + 2] = 0.965; // B
      } else {
        // Pink particles
        colors[i * 3] = 0.925;     // R
        colors[i * 3 + 1] = 0.282; // G
        colors[i * 3 + 2] = 0.600; // B
      }
    }

    return [positions, colors]; // Return both arrays
  }, []); // Empty deps = compute only once on mount

  // useFrame: Called every animation frame (~60fps)
  // Slowly rotates the entire particle cloud
  useFrame((state) => {
    if (mesh.current) {
      // Rotate around X axis at 0.02 radians per second
      mesh.current.rotation.x = state.clock.elapsedTime * 0.02;
      // Rotate around Y axis at 0.03 radians per second (slightly faster)
      mesh.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    // Three.js Points object — renders many particles efficiently as a single draw call
    <points ref={mesh}>
      {/* Buffer geometry holds the particle data in GPU-friendly format */}
      <bufferGeometry>
        {/* Position attribute: where each particle is located in 3D space */}
        <bufferAttribute
          attach="attributes-position" // Tells R3F this is the position attribute
          args={[positions, 3]}        // [data array, items per vertex (x,y,z = 3)]
        />
        {/* Color attribute: RGB color for each particle */}
        <bufferAttribute
          attach="attributes-color"    // Tells R3F this is the color attribute
          args={[colors, 3]}           // [data array, items per vertex (r,g,b = 3)]
        />
      </bufferGeometry>
      {/* Material: how particles look when rendered */}
      <pointsMaterial
        size={0.04}           // Size of each particle point
        vertexColors          // Use per-vertex colors (from color attribute above)
        transparent           // Enable transparency
        opacity={0.8}         // 80% opaque (slightly see-through)
        sizeAttenuation       // Particles get smaller as they get further from camera
      />
    </points>
  );
}

// =============================================================================
// NEURAL CONNECTIONS SUB-COMPONENT
// Renders a network of nodes connected by lines — simulating a neural network.
// Nodes that are within 4 units of each other get connected.
// The entire network slowly rotates for a dynamic feel.
// =============================================================================
function NeuralConnections() {
  // Ref to the line segments object for per-frame rotation
  const linesRef = useRef<THREE.LineSegments>(null);

  // Number of nodes in the neural network
  const nodeCount = 30;

  // useMemo: Compute node positions and connection lines once
  const [positions, linePositions] = useMemo(() => {
    // Generate random 3D positions for each node
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 12, // X: random in [-6, 6]
          (Math.random() - 0.5) * 12, // Y: random in [-6, 6]
          (Math.random() - 0.5) * 8   // Z: random in [-4, 4] (shallower depth)
        )
      );
    }

    // Build connection lines between nodes that are close enough
    const linePoints: number[] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        // Calculate Euclidean distance between two nodes
        const dist = nodes[i].distanceTo(nodes[j]);
        // Only connect nodes within 4 units of each other
        if (dist < 4) {
          // Add start point of line segment (node i)
          linePoints.push(nodes[i].x, nodes[i].y, nodes[i].z);
          // Add end point of line segment (node j)
          linePoints.push(nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
    }

    // Return nodes array and connection lines as Float32Array
    return [nodes, new Float32Array(linePoints)];
  }, []); // Compute once on mount

  // useFrame: Rotate the neural network slowly each frame
  useFrame((state) => {
    if (linesRef.current) {
      // Constant slow rotation around Y axis
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.015;
      // Gentle oscillation around X axis using sine wave
      linesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <>
      {/* Line segments connecting nearby nodes */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          {/* Position data for all line segment start/end points */}
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]} // [data, 3 floats per vertex]
          />
        </bufferGeometry>
        {/* Semi-transparent cyan lines */}
        <lineBasicMaterial color={COLORS.cyan} transparent opacity={0.15} />
      </lineSegments>

      {/* Render a small sphere at each node position */}
      {positions.map((pos, i) => (
        <mesh key={i} position={[pos.x, pos.y, pos.z]}>
          {/* Small sphere geometry: radius 0.06, 8 segments */}
          <sphereGeometry args={[0.06, 8, 8]} />
          {/* Semi-transparent violet material */}
          <meshBasicMaterial color={COLORS.violet} transparent opacity={0.5} />
        </mesh>
      ))}
    </>
  );
}

// =============================================================================
// PARTICLE FIELD (MAIN EXPORT)
// The top-level component that sets up the Three.js Canvas and renders
// both the floating particles and the neural network inside it.
// This component fills its parent container absolutely.
// =============================================================================
export default function ParticleField() {
  return (
    // Absolute positioning fills the hero section background
    <div className="absolute inset-0 z-0">
      {/* R3F Canvas: creates a WebGL renderer and Three.js scene */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }} // Camera at z=8, 60° field of view
        style={{ background: "transparent" }}       // Transparent so page bg shows through
      >
        {/* Floating colored particles */}
        <Particles />
        {/* Neural network nodes and connections */}
        <NeuralConnections />
      </Canvas>
    </div>
  );
}
