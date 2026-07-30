"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, Environment, Center } from "@react-three/drei";
import * as THREE from "three";

/* Preload the model so there's no delay when rendering */
useGLTF.preload("/3d-animations/hero-animation.glb");

function Model({ scrollProgress }) {
  const group = useRef();
  const { scene, animations } = useGLTF("/3d-animations/hero-animation.glb");
  const { actions, names } = useAnimations(animations, group);

  // Set up materials and shadow settings
  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // Improve texture quality & color space
        if (child.material) {
          child.material.roughness = child.material.roughness ?? 0.6;
          child.material.envMapIntensity = 1.0;
        }
      }
    });
  }, [scene]);

  // Sync animation frame with scroll position
  useFrame(() => {
    if (!actions || names.length === 0) return;

    // Apply scroll progress to all animation clips in the GLB file
    names.forEach((name) => {
      const action = actions[name];
      if (action) {
        if (!action.isRunning()) {
          action.play();
          action.paused = true;
        }
        const clipDuration = action.getClip().duration;
        // Clamp scrollProgress between 0 and 1
        const clampedProgress = Math.max(0, Math.min(1, scrollProgress));
        action.time = clampedProgress * clipDuration;
      }
    });
  });

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

export function Hero3DCanvas({ scrollProgress = 0 }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.2, 4.5], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      className="h-full w-full"
    >
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[6, 10, 6]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={20}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-4, 6, -2]} intensity={0.5} color="#E4E0DE" />

      {/* Soft environment lighting */}
      <Environment preset="city" environmentIntensity={0.6} />

      <Center top position={[0, -0.6, 0]}>
        <Model scrollProgress={scrollProgress} />
      </Center>
    </Canvas>
  );
}
