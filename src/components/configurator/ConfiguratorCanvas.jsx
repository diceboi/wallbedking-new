"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  useAnimations,
  Environment,
  OrbitControls,
  ContactShadows,
  Html,
} from "@react-three/drei";
import * as THREE from "three";

// Preload the model for faster load times
useGLTF.preload("/3d-animations/MORPHY-Vertical-Integrated-160-200.glb");

function Model({ isFolded, sofaIncluded }) {
  const group = useRef();

  // Load the GLB file
  const { scene, animations } = useGLTF(
    "/3d-animations/MORPHY-Vertical-Integrated-160-200.glb",
  );
  const { actions } = useAnimations(animations, group);

  // Keep track of the current progress values in refs for smooth frame-by-frame interpolation
  const currentProgress = useRef(0); // 0 = open (flat), 1 = closed (folded up)
  const currentOpacity = useRef(sofaIncluded ? 1 : 0);

  // Ref to hold the sofa meshes to avoid traversing the scene graph in the render loop
  const sofaMeshes = useRef([]);

  // Detect sofa and cabinet mesh parts by their prefixes (case-insensitive)
  const isSofaPart = (name) => name.toUpperCase().startsWith("SOFA_");
  const isCabinetPart = (name) => name.toUpperCase().startsWith("CABINET_");

  // Setup initial shadows, double-sided materials, environment maps, and collect sofa/cabinet meshes
  useEffect(() => {
    if (!scene) return;

    const collected = [];
    let cabinetCount = 0;

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          child.material.side = THREE.DoubleSide;
          child.material.roughness = child.material.roughness ?? 0.55;
          child.material.envMapIntensity = 1.0;
        }

        // Setup cabinet parts with 0.3 opacity (semi-transparent)
        if (isCabinetPart(child.name)) {
          if (child.material) {
            if (!child.userData.originalMaterial) {
              child.userData.originalMaterial = child.material;
              child.material = child.material.clone();
            }
            child.material.transparent = true;
            child.material.opacity = 0.3;
            child.material.depthWrite = false;
          }
          cabinetCount++;
        }

        // Collect and clone materials of sofa parts only once
        if (isSofaPart(child.name)) {
          if (child.material) {
            if (!child.userData.originalMaterial) {
              child.userData.originalMaterial = child.material;
              child.material = child.material.clone();
            }
            child.material.transparent = true;
            child.material.opacity = sofaIncluded ? 1 : 0;
          }
          child.visible = sofaIncluded;
          collected.push(child);
        }
      }
    });

    sofaMeshes.current = collected;
    console.log("[Sofa] Collected", collected.length, "SOFA_ meshes");
    console.log(
      "[Cabinet] Configured",
      cabinetCount,
      "CABINET_ meshes with 0.3 opacity",
    );
  }, [scene]);

  // Perform frame updates for animation times and opacity transitions
  useFrame((state, delta) => {
    // 1. Interpolate bed folding animation progress (speed controlled by delta)
    const targetProgress = isFolded ? 1 : 0;
    currentProgress.current = THREE.MathUtils.lerp(
      currentProgress.current,
      targetProgress,
      Math.min(1, delta * 3.5),
    );

    // Sync progress values to animation clip times
    const bedAction = actions["bed-fold"];
    const sofaAction = actions["sofa-animation"];

    if (bedAction) {
      if (!bedAction.isRunning()) {
        bedAction.play();
        bedAction.paused = true;
      }
      const duration = bedAction.getClip().duration;
      bedAction.time =
        Math.max(0, Math.min(1, currentProgress.current)) * duration;
    }

    if (sofaAction) {
      if (!sofaAction.isRunning()) {
        sofaAction.play();
        sofaAction.paused = true;
      }
      const duration = sofaAction.getClip().duration;
      sofaAction.time =
        Math.max(0, Math.min(1, currentProgress.current)) * duration;
    }

    // 2. Smooth fade-in and fade-out opacity transition for Sofa
    const targetOpacity = sofaIncluded ? 1 : 0;
    currentOpacity.current = THREE.MathUtils.lerp(
      currentOpacity.current,
      targetOpacity,
      Math.min(1, delta * 5.0),
    );
    const opacityVal = currentOpacity.current;
    const isVisible = opacityVal > 0.01;

    for (let i = 0; i < sofaMeshes.current.length; i++) {
      const mesh = sofaMeshes.current[i];
      mesh.visible = isVisible;
      if (mesh.material) {
        mesh.material.opacity = opacityVal;
      }
    }
  });

  return (
    <group
      ref={group}
      position={[0, -0.9, 0]}
      // 45° Y tengely = (45 * Math.PI) / 180
      rotation={[0, (45 * Math.PI) / 180, 0]}
      scale={[1.1, 1.1, 1.1]}
      dispose={null}
    >
      <primitive object={scene} dispose={null} />

      {/* Floating 3D Badge indicating cabinet is not included */}
      <Html
        position={[1.25, 1.45, 0.1]}
        center
        distanceFactor={6.5}
        zIndexRange={[10, 0]}
        className="pointer-events-none select-none"
      >
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-wbk-brown/30 shadow-xs whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-wbk-brown/80 animate-pulse" />
          <span className="font-poppins text-[8px] font-medium tracking-wider text-wbk-black/85 uppercase">
            Cabinet not included
          </span>
        </div>
      </Html>
    </group>
  );
}

export function ConfiguratorCanvas({ isFolded = false, sofaIncluded = true }) {
  // Generate a unique key per instance to prevent canvas DOM reuse and WebGL context clashes
  const [canvasKey] = useState(
    () => "canvas_" + Math.random().toString(36).substring(2, 9),
  );

  return (
    <div className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing touch-none select-none">
      <Canvas
        key={canvasKey}
        shadows="soft"
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.8,
        }}
        camera={{ position: [0, 1.4, 6.5], fov: 38 }}
      >
        {/* ── BALANCED STUDIO LIGHTING SETUP ── */}

        {/* 1. Subtle warm ambient + hemisphere light for soft ground bounce */}
        <hemisphereLight
          skyColor="#ffffff"
          groundColor="#dcd7d2"
          intensity={0.8}
        />

        {/* 2. Primary Key Light (Soft warm sunlight) */}
        <directionalLight
          position={[5, 8, 6]}
          intensity={1.15}
          color="#fffaf0"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0001}
        />

        {/* 3. Fill Light (Soft cool light to gently lift shadows) */}
        <directionalLight position={[-6, 4, 4]} intensity={2} color="#edf2f7" />

        {/* 4. Top Rim / Back Light (Subtle edge separation) */}
        <directionalLight
          position={[0, 7, -6]}
          intensity={0.45}
          color="#ffffff"
        />

        {/* 5. HDRI Environment Preset for natural micro-reflections */}
        <Environment preset="apartment" environmentIntensity={0.25} />

        {/* 3D Model of the Bed */}
        <Suspense fallback={null}>
          <Model isFolded={isFolded} sofaIncluded={sofaIncluded} />
        </Suspense>

        {/* Studio Floor Contact Shadows - crisp and well-defined */}
        <ContactShadows
          position={[0, -0.905, 0]}
          opacity={0.1}
          scale={8.5}
          blur={0.5}
          far={1.8}
          resolution={2048}
          color="#1e1c1a"
        />

        <ContactShadows
          position={[0, -0.905, 0]}
          opacity={0.6}
          scale={8.5}
          blur={4}
          far={1.8}
          resolution={2048}
          color="#1e1c1a"
        />

        {/* Orbit Controls – horizontal rotation only, no zoom, no pan */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.9}
          enableZoom={false}
          enablePan={false}
          target={[0, 0.2, 0]}
          minPolarAngle={Math.PI / 2.4}
          maxPolarAngle={Math.PI / 2.4}
        />
      </Canvas>
    </div>
  );
}
