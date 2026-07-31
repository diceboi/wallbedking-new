"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  useGLTF,
  useAnimations,
  Environment,
  OrbitControls,
  ContactShadows,
  Sparkles,
} from "@react-three/drei";
import {
  EffectComposer,
  Vignette,
  Bloom,
  ToneMapping,
  BrightnessContrast,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useControls, button, Leva } from "leva";
import * as THREE from "three";

/* Filter out Three.js v0.185+ THREE.Clock deprecation warning from internal R3F/Drei loops */
if (typeof window !== "undefined") {
  const _origWarn = console.warn;
  console.warn = function (...args) {
    if (
      typeof args[0] === "string" &&
      args[0].includes("THREE.Clock: This module has been deprecated")
    ) {
      return;
    }
    _origWarn.apply(console, args);
  };
}

/* Preload the model */
useGLTF.preload("/3d-animations/hero-animation.glb");

function Model({ scrollProgress, position, rotation, scale }) {
  const group = useRef();
  const smoothProgressRef = useRef(0);
  const { scene, animations } = useGLTF("/3d-animations/hero-animation.glb");
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.side = THREE.DoubleSide;
          child.material.roughness = child.material.roughness ?? 0.6;
          child.material.envMapIntensity = 0.9;
        }
      }
    });
  }, [scene]);

  // Sync animation frame smoothly with frame lerp interpolation
  useFrame((_, delta) => {
    if (!actions || names.length === 0) return;

    smoothProgressRef.current = THREE.MathUtils.lerp(
      smoothProgressRef.current,
      scrollProgress,
      Math.min(1, delta * 10),
    );

    const progress = Math.max(0, Math.min(1, smoothProgressRef.current));

    names.forEach((name) => {
      const action = actions[name];
      if (action) {
        if (!action.isRunning()) {
          action.play();
          action.paused = true;
        }
        const clipDuration = action.getClip().duration;
        action.time = progress * clipDuration;
      }
    });
  });

  const radRotation = [
    (rotation[0] * Math.PI) / 180,
    (rotation[1] * Math.PI) / 180,
    (rotation[2] * Math.PI) / 180,
  ];

  return (
    <group
      ref={group}
      position={position}
      rotation={radRotation}
      scale={[scale, scale, scale]}
      dispose={null}
    >
      <primitive object={scene} />
    </group>
  );
}

/* Dynamic camera updater that smoothly interpolates camera position & rotation */
function CameraUpdater({
  basePos,
  fov,
  baseRot,
  mode,
  target,
  scrollProgress,
  scrollShift,
}) {
  const { camera } = useThree();
  const smoothScrollRef = useRef(0);

  useFrame((_, delta) => {
    smoothScrollRef.current = THREE.MathUtils.lerp(
      smoothScrollRef.current,
      scrollProgress,
      Math.min(1, delta * 10),
    );

    const clampedProgress = Math.max(0, Math.min(1, smoothScrollRef.current));

    const currentX = basePos[0] + clampedProgress * scrollShift.shiftX;
    const currentY = basePos[1] + clampedProgress * scrollShift.shiftY;
    const currentZ = basePos[2] + clampedProgress * scrollShift.shiftZ;

    camera.position.set(currentX, currentY, currentZ);
    camera.fov = fov;

    if (mode === "rotation") {
      const currentYaw = baseRot[1] + clampedProgress * scrollShift.shiftYaw;
      camera.rotation.set(
        (baseRot[0] * Math.PI) / 180,
        (currentYaw * Math.PI) / 180,
        (baseRot[2] * Math.PI) / 180,
        "YXZ",
      );
    } else {
      const currentTargetX = target[0] + clampedProgress * scrollShift.shiftX;
      camera.lookAt(currentTargetX, target[1], target[2]);
    }

    camera.updateProjectionMatrix();
  });

  return null;
}

export function Hero3DCanvas({ scrollProgress = 0 }) {
  // ── Camera Base Configuration ──
  const cameraConfig = useControls("📷 Camera & Base Framing", {
    controlMode: {
      value: "rotation",
      options: ["rotation", "target"],
      label: "Control Mode",
    },
    posX: { value: 1.2, min: -15, max: 15, step: 0.1, label: "Pos X" },
    posY: { value: 0.8, min: -5, max: 15, step: 0.1, label: "Pos Y" },
    posZ: { value: 5.7, min: -15, max: 20, step: 0.1, label: "Pos Z" },

    rotX: {
      value: 0.0,
      min: -90,
      max: 90,
      step: 0.5,
      label: "Pitch (Tilt Up/Down)",
    },
    rotY: {
      value: 7.0,
      min: -180,
      max: 180,
      step: 0.5,
      label: "Yaw (Pan Left/Right)",
    },
    rotZ: {
      value: 0.0,
      min: -90,
      max: 90,
      step: 0.5,
      label: "Roll (Tilt Side)",
    },

    targetX: { value: 1.9, min: -10, max: 10, step: 0.1, label: "Target X" },
    targetY: { value: 2.2, min: -10, max: 10, step: 0.1, label: "Target Y" },
    targetZ: { value: 1.3, min: -10, max: 10, step: 0.1, label: "Target Z" },

    fov: { value: 32, min: 10, max: 120, step: 1, label: "FOV" },
    enableOrbitMouse: { value: false, label: "Enable Drag Orbit (Dev)" },
  });

  // ── Scroll Camera Shift ──
  const scrollConfig = useControls("📜 Scroll Camera Movement", {
    shiftX: {
      value: 1.0,
      min: -10,
      max: 10,
      step: 0.1,
      label: "Scroll Shift Right (+X)",
    },
    shiftY: {
      value: 0.1,
      min: -5,
      max: 5,
      step: 0.1,
      label: "Scroll Shift Up/Down (+Y)",
    },
    shiftZ: {
      value: 0.0,
      min: -10,
      max: 10,
      step: 0.1,
      label: "Scroll Shift Forward/Back (+Z)",
    },
    shiftYaw: {
      value: 11.5,
      min: -45,
      max: 45,
      step: 0.5,
      label: "Scroll Yaw Pan (Degrees)",
    },
  });

  // ── Lighting & Shadows Tuning ──
  const lightConfig = useControls("💡 Cinematic Lighting & Shadows", {
    ambientIntensity: { value: 0.1, min: 0, max: 4, step: 0.1 },
    sunIntensity: { value: 6.0, min: 0, max: 10, step: 0.1 },
    sunColor: { value: "#fff4e0" },
    sunX: { value: -19.0, min: -40, max: 40, step: 0.5 },
    sunY: { value: 2.5, min: 0, max: 30, step: 0.5 },
    sunZ: { value: 9.0, min: -20, max: 30, step: 0.5 },
    fillIntensity: { value: 1.2, min: 0, max: 4, step: 0.1 },
    fillColor: { value: "#dce5f2" },
    fillX: { value: -30.0, min: -40, max: 40, step: 0.5 },
    fillY: { value: 0.0, min: -10, max: 30, step: 0.5 },
    fillZ: { value: 12.5, min: -20, max: 30, step: 0.5 },
    envPreset: {
      value: "apartment",
      options: ["apartment", "city", "studio", "sunset", "dawn", "lobby"],
    },
    envIntensity: { value: 1.0, min: 0, max: 3, step: 0.1 },
    exposure: { value: 0.7, min: 0.1, max: 3, step: 0.05 },
    shadowBias: { value: -0.00005, min: -0.001, max: 0, step: 0.00001 },
    contactShadowOpacity: { value: 0.4, min: 0, max: 1, step: 0.05 },
    contactShadowBlur: { value: 3.5, min: 0.5, max: 5, step: 0.1 },
  });

  // ── Film Effects & Sunbeam Particles ──
  const fxConfig = useControls("🎬 Film Effects & Particles", {
    enableFX: { value: true },
    vignetteDarkness: { value: 1.0, min: 0, max: 1, step: 0.05 },
    vignetteOffset: { value: 0.15, min: 0, max: 1, step: 0.05 },
    bloomIntensity: { value: 0.95, min: 0, max: 3, step: 0.05 },
    contrast: { value: 0.0, min: -0.5, max: 0.5, step: 0.01 },

    // Animated Sunbeam Light Particles
    enableSparkles: { value: true, label: "Enable Light Particles" },
    sparkleCount: {
      value: 120,
      min: 10,
      max: 300,
      step: 10,
      label: "Particle Count",
    },
    sparkleSize: {
      value: 4.5,
      min: 1,
      max: 15,
      step: 0.5,
      label: "Particle Size",
    },
    sparkleSpeed: {
      value: 0.4,
      min: 0.1,
      max: 5,
      step: 0.1,
      label: "Particle Speed",
    },
    sparkleOpacity: {
      value: 0.2,
      min: 0.1,
      max: 1,
      step: 0.05,
      label: "Particle Opacity",
    },
  });

  // ── Model Transform ──
  const modelConfig = useControls("📦 Model Transform", {
    posX: { value: 0.0, min: -10, max: 10, step: 0.1 },
    posY: { value: 0.0, min: -10, max: 10, step: 0.1 },
    posZ: { value: 0.0, min: -10, max: 10, step: 0.1 },
    rotX: { value: 0, min: -180, max: 180, step: 1 },
    rotY: { value: 0, min: -180, max: 180, step: 1 },
    rotZ: { value: 0, min: -180, max: 180, step: 1 },
    scale: { value: 1.0, min: 0.1, max: 5, step: 0.05 },
  });

  useControls({
    "📋 Copy Config to Console": button(() => {
      const snippet = `
// ── Final Config Snapshot ──
camera={{
  position: [${cameraConfig.posX}, ${cameraConfig.posY}, ${cameraConfig.posZ}],
  rotation: [${cameraConfig.rotX}, ${cameraConfig.rotY}, ${cameraConfig.rotZ}],
  fov: ${cameraConfig.fov}
}}

scrollShift={{
  shiftX: ${scrollConfig.shiftX},
  shiftY: ${scrollConfig.shiftY},
  shiftZ: ${scrollConfig.shiftZ},
  shiftYaw: ${scrollConfig.shiftYaw}
}}
`;
      console.log(snippet);
      alert("Config printed to browser Console (F12)!");
    }),
  });

  const cameraPos = [cameraConfig.posX, cameraConfig.posY, cameraConfig.posZ];
  const cameraRot = [cameraConfig.rotX, cameraConfig.rotY, cameraConfig.rotZ];
  const cameraTarget = [
    cameraConfig.targetX,
    cameraConfig.targetY,
    cameraConfig.targetZ,
  ];
  const modelPos = [modelConfig.posX, modelConfig.posY, modelConfig.posZ];
  const modelRot = [modelConfig.rotX, modelConfig.rotY, modelConfig.rotZ];

  return (
    <>
      <Leva
        titleBar={{ title: "Cinematic Studio Controls" }}
        collapsed={false}
        hidden
      />

      <div
        className={`h-full w-full ${!cameraConfig.enableOrbitMouse ? "pointer-events-none" : ""}`}
      >
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          camera={{
            position: cameraPos,
            fov: cameraConfig.fov,
            near: 0.1,
            far: 25.0,
          }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: lightConfig.exposure,
          }}
          className="h-full w-full"
        >
          <CameraUpdater
            basePos={cameraPos}
            fov={cameraConfig.fov}
            baseRot={cameraRot}
            mode={cameraConfig.controlMode}
            target={cameraTarget}
            scrollProgress={scrollProgress}
            scrollShift={scrollConfig}
          />

          <ambientLight intensity={lightConfig.ambientIntensity} />

          <directionalLight
            position={[lightConfig.sunX, lightConfig.sunY, lightConfig.sunZ]}
            intensity={lightConfig.sunIntensity}
            color={lightConfig.sunColor}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-near={0.5}
            shadow-camera-far={40}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
            shadow-bias={lightConfig.shadowBias}
          />

          <directionalLight
            position={[lightConfig.fillX, lightConfig.fillY, lightConfig.fillZ]}
            intensity={lightConfig.fillIntensity}
            color={lightConfig.fillColor}
          />

          <Environment
            preset={lightConfig.envPreset}
            environmentIntensity={lightConfig.envIntensity}
          />

          {/* High density floating sunbeam dust particles right in front of camera */}
          {fxConfig.enableSparkles && (
            <>
              <Sparkles
                count={fxConfig.sparkleCount}
                scale={[8, 5, 8]}
                size={fxConfig.sparkleSize}
                speed={fxConfig.sparkleSpeed}
                opacity={fxConfig.sparkleOpacity}
                color={lightConfig.sunColor}
                position={[0, 1.2, 2.5]}
              />
              <Sparkles
                count={Math.floor(fxConfig.sparkleCount / 2)}
                scale={[6, 4, 6]}
                size={fxConfig.sparkleSize * 1.5}
                speed={fxConfig.sparkleSpeed * 0.7}
                opacity={fxConfig.sparkleOpacity * 0.8}
                color="#FFFFFF"
                position={[-1, 1.5, 1]}
              />
            </>
          )}

          <ContactShadows
            position={[1.2, 0.01, 1.3]}
            opacity={lightConfig.contactShadowOpacity}
            scale={18}
            blur={lightConfig.contactShadowBlur}
            far={6}
            color="#1c1917"
          />

          {cameraConfig.enableOrbitMouse ? (
            <OrbitControls
              makeDefault
              target={cameraTarget}
              enableZoom={true}
            />
          ) : (
            <OrbitControls enabled={false} target={cameraTarget} />
          )}

          <Model
            scrollProgress={scrollProgress}
            position={modelPos}
            rotation={modelRot}
            scale={modelConfig.scale}
          />

          {fxConfig.enableFX && (
            <EffectComposer disableNormalPass>
              <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
              <Vignette
                darkness={fxConfig.vignetteDarkness}
                offset={fxConfig.vignetteOffset}
              />
              <Bloom
                intensity={fxConfig.bloomIntensity}
                luminanceThreshold={0.8}
                mipmapBlur
              />
              <BrightnessContrast contrast={fxConfig.contrast} />
            </EffectComposer>
          )}
        </Canvas>
      </div>
    </>
  );
}
