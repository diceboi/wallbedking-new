"use client";

import React, { Suspense, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  useGLTF,
} from "@react-three/drei";
import { useSofaConfiguratorStore } from "./store/useSofaConfiguratorStore";
import { SofaModule, checkModuleSnap } from "./SofaModule";
import { DimensionsOverlay } from "./DimensionsOverlay";
import { modulesData, getAssetUrl } from "./data/modules";
import * as THREE from "three";
import {
  PiMouseLeftClickFill,
  PiMouseRightClickFill,
  PiMouseMiddleClickFill,
} from "react-icons/pi";
import { TbHandFinger, TbHandTwoFingers } from "react-icons/tb";
import { FaRegHandPeace } from "react-icons/fa";

// Preload all models
if (typeof window !== "undefined") {
  modulesData.forEach(module => {
    if (module.modelPath) {
      useGLTF.preload(getAssetUrl(module.modelPath));
    }
  });
}

function DropListener() {
  const { camera, raycaster } = useThree();
  const setPreviewModule = useSofaConfiguratorStore(
    (state) => state.setPreviewModule,
  );
  const addModuleAtPosition = useSofaConfiguratorStore(
    (state) => state.addModuleAtPosition,
  );
  const selectedModules = useSofaConfiguratorStore(
    (state) => state.selectedModules,
  );

  useEffect(() => {
    const canvasEl = document.querySelector(".sofa-scene-container canvas");
    if (!canvasEl) return;

    const handleDragOver = (e) => {
      const currentPreview = useSofaConfiguratorStore.getState().previewModule;
      if (currentPreview) {
        const clientX = e.detail.clientX;
        const clientY = e.detail.clientY;
        const rect = canvasEl.getBoundingClientRect();
        
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          const x = ((clientX - rect.left) / rect.width) * 2 - 1;
          const y = -((clientY - rect.top) / rect.height) * 2 + 1;

          const pointer = new THREE.Vector2(x, y);
          raycaster.setFromCamera(pointer, camera);

          const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
          const intersection = new THREE.Vector3();
          raycaster.ray.intersectPlane(floorPlane, intersection);

          if (intersection) {
            const moduleDef = modulesData.find(
              (m) => m.id === currentPreview.moduleId,
            );
            if (moduleDef) {
              const snap = checkModuleSnap(
                intersection,
                currentPreview.rotation || [0, 0, 0],
                moduleDef,
                selectedModules,
              );
              setPreviewModule({
                ...currentPreview,
                position: [snap.pos.x, 0, snap.pos.z],
                rotation: snap.rot,
              });
            }
          }
        } else {
          setPreviewModule({
            ...currentPreview,
            position: [0, -100, 0],
          });
        }
      }
    };

    const handleDrop = (e) => {
      const moduleId = e.detail.moduleId;
      if (!moduleId) return;
      
      const clientX = e.detail.clientX;
      const clientY = e.detail.clientY;
      const rect = canvasEl.getBoundingClientRect();
      const currentPreview = useSofaConfiguratorStore.getState().previewModule;
      
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        if (currentPreview && currentPreview.position[1] !== -100) {
          addModuleAtPosition(
            moduleId,
            currentPreview.position,
            currentPreview.rotation,
          );
        } else {
          const x = ((clientX - rect.left) / rect.width) * 2 - 1;
          const y = -((clientY - rect.top) / rect.height) * 2 + 1;

          const pointer = new THREE.Vector2(x, y);
          raycaster.setFromCamera(pointer, camera);

          const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
          const intersection = new THREE.Vector3();
          raycaster.ray.intersectPlane(floorPlane, intersection);

          if (intersection) {
            addModuleAtPosition(
              moduleId,
              [intersection.x, 0, intersection.z],
              [0, 0, 0],
            );
          }
        }
      }
      setPreviewModule(null);
    };

    window.addEventListener("customDragOver", handleDragOver);
    window.addEventListener("customDrop", handleDrop);
    return () => {
      window.removeEventListener("customDragOver", handleDragOver);
      window.removeEventListener("customDrop", handleDrop);
    };
  }, [camera, raycaster, setPreviewModule, addModuleAtPosition, selectedModules]);

  return null;
}

export function SofaScene() {
  const selectedModules = useSofaConfiguratorStore(
    (state) => state.selectedModules,
  );
  const selectedFabric = useSofaConfiguratorStore((state) => state.selectedFabric);
  const previewModule = useSofaConfiguratorStore((state) => state.previewModule);
  const updateModulePosition = useSofaConfiguratorStore(
    (state) => state.updateModulePosition,
  );

  const activeModuleId = useSofaConfiguratorStore((state) => state.activeModuleId);
  const setActiveModule = useSofaConfiguratorStore(
    (state) => state.setActiveModule,
  );
  const updateModuleFabric = useSofaConfiguratorStore(
    (state) => state.updateModuleFabric,
  );
  const removeModule = useSofaConfiguratorStore((state) => state.removeModule);

  const updateModuleRotation = useSofaConfiguratorStore(
    (state) => state.updateModuleRotation,
  );
  const cleanUpArmrests = useSofaConfiguratorStore(
    (state) => state.cleanUpArmrests,
  );
  const showDimensions = useSofaConfiguratorStore((state) => state.showDimensions);

  const [controlsEnabled, setControlsEnabled] = useState(true);

  const handlePointerMissed = () => {
    setActiveModule(null);
  };

  return (
    <div className="sofa-scene-container w-full h-full relative select-none">
      {/* Interaction Controls Guide Overlay */}
      <div
        id="helper-ui"
        className="absolute top-16 left-3 sm:left-6 flex flex-wrap gap-3 z-10 p-2 bg-white/80 backdrop-blur-md rounded-none border border-wbk-lightgrey/60 text-wbk-black shadow-xs pointer-events-none"
      >
        <div className="flex items-center gap-1.5">
          <PiMouseLeftClickFill className="hidden sm:block w-4 h-4 text-wbk-gold" />
          <TbHandFinger className="block sm:hidden w-4 h-4 text-wbk-gold" />
          <span className="text-[11px] font-medium text-wbk-brown">Rotate & Grab</span>
        </div>
        <div className="flex items-center gap-1.5">
          <PiMouseRightClickFill className="hidden sm:block w-4 h-4 text-wbk-gold" />
          <TbHandTwoFingers className="block sm:hidden w-4 h-4 text-wbk-gold" />
          <span className="text-[11px] font-medium text-wbk-brown">Move & Pan</span>
        </div>
        <div className="flex items-center gap-1.5">
          <PiMouseMiddleClickFill className="hidden sm:block w-4 h-4 text-wbk-gold" />
          <FaRegHandPeace className="block sm:hidden w-4 h-4 text-wbk-gold" />
          <span className="text-[11px] font-medium text-wbk-brown">Zoom</span>
        </div>
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 2.2, 3.8], fov: 45 }}
        onPointerMissed={handlePointerMissed}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          castShadow
          position={[5, 10, 5]}
          intensity={1.2}
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0005}
        >
          <orthographicCamera
            attach="shadow-camera"
            args={[-15, 15, 15, -15, 0.1, 50]}
          />
        </directionalLight>

        <Environment preset="city" />

        <Suspense fallback={null}>
          <DropListener />
          <group>
            {selectedModules.map((moduleData) => (
              <SofaModule
                key={moduleData.instanceId}
                moduleData={moduleData}
                fabricId={moduleData.fabricId || selectedFabric}
                onDragStart={() => setControlsEnabled(false)}
                onDragEnd={() => setControlsEnabled(true)}
                allModules={selectedModules}
                updateModulePosition={updateModulePosition}
                updateModuleRotation={updateModuleRotation}
                cleanUpArmrests={cleanUpArmrests}
                isActive={activeModuleId === moduleData.instanceId}
                setActiveModule={setActiveModule}
                updateModuleFabric={updateModuleFabric}
                removeModule={removeModule}
              />
            ))}
            {previewModule && previewModule.position[1] !== -100 && (
              <SofaModule
                key="preview-item"
                moduleData={{
                  instanceId: "preview-instance",
                  moduleId: previewModule.moduleId,
                  position: previewModule.position,
                  rotation: previewModule.rotation,
                }}
                fabricId={selectedFabric}
                isPreview={true}
              />
            )}
            {showDimensions && <DimensionsOverlay />}
          </group>

          {/* Real shadow receiver plane */}
          <mesh
            receiveShadow
            position={[0, -0.005, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            raycast={() => null}
          >
            <planeGeometry args={[50, 50]} />
            <shadowMaterial transparent opacity={0.15} />
          </mesh>

          {/* Ambient Contact Shadows */}
          <ContactShadows
            position={[0, -0.01, 0]}
            opacity={0.65}
            scale={25}
            blur={2.8}
            far={2}
            resolution={2048}
            color="#090A0A"
          />
        </Suspense>

        <OrbitControls
          makeDefault
          enabled={controlsEnabled}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2 - 0.05}
          enablePan={true}
          enableZoom={true}
          dampingFactor={0.15}
        />
      </Canvas>
    </div>
  );
}
