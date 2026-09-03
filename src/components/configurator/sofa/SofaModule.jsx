"use client";

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Html, useGLTF } from '@react-three/drei';
import { fabricsData } from './data/fabrics';
import { modulesData, getAssetUrl } from './data/modules';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

export function checkModuleSnap(currentPos, currentRot, moduleDef, allModules, ignoreInstanceId = null) {
  const SNAP_DISTANCE = 0.3;
  let closestSnapPos = currentPos.clone();
  let targetRot = [...currentRot];
  let minDistance = Infinity;
  
  const myConnectors = moduleDef.connectors.map(c => {
    const localPos = new THREE.Vector3(c.position[0], c.position[1], c.position[2]);
    localPos.applyEuler(new THREE.Euler(currentRot[0], currentRot[1], currentRot[2]));
    return {
      ...c,
      worldPos: localPos.add(currentPos),
    };
  });

  allModules.forEach(otherMod => {
    if (ignoreInstanceId && otherMod.instanceId === ignoreInstanceId) return;
    
    const otherDef = modulesData.find(m => m.id === otherMod.moduleId);
    if (!otherDef) return;

    const otherRot = otherMod.rotation || [0, 0, 0];
    const otherConnectors = otherDef.connectors.map(c => {
      const localPos = new THREE.Vector3(c.position[0], c.position[1], c.position[2]);
      localPos.applyEuler(new THREE.Euler(otherRot[0], otherRot[1], otherRot[2]));
      return {
        ...c,
        worldPos: localPos.add(new THREE.Vector3(...otherMod.position)),
      };
    });

    myConnectors.forEach(myConn => {
      otherConnectors.forEach(otherConn => {
        if (myConn.accepts.includes(otherConn.id) || otherConn.accepts.includes(myConn.id)) {
          const distance = myConn.worldPos.distanceTo(otherConn.worldPos);
          if (distance < SNAP_DISTANCE && distance < minDistance) {
            minDistance = distance;
            
            const localPosRotated = new THREE.Vector3(myConn.position[0], myConn.position[1], myConn.position[2]);
            localPosRotated.applyEuler(new THREE.Euler(currentRot[0], currentRot[1], currentRot[2]));
            closestSnapPos = otherConn.worldPos.clone().sub(localPosRotated);
            
            if (moduleDef.type === 'armrest') {
              targetRot = [...otherRot];
              
              if (otherConn.id.includes('right')) {
                targetRot[1] = (otherRot[1] + Math.PI) % (Math.PI * 2);
              } else if (otherConn.id.includes('back')) {
                targetRot[1] = (otherRot[1] - Math.PI / 2) % (Math.PI * 2);
              } else if (otherConn.id.includes('front')) {
                targetRot[1] = (otherRot[1] + Math.PI / 2) % (Math.PI * 2);
              }
            }
          }
        }
      });
    });
  });

  return { pos: closestSnapPos, rot: targetRot };
}

function RealModel({ url, color, isActive = false, isHovered = false, isPreview = false }) {
  const { scene } = useGLTF(url);
  
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);
    
    clone.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = !isPreview;
        node.receiveShadow = !isPreview;
        if (node.material) {
          node.material = node.material.clone();
        }
      }
    });

    if (url && url.toLowerCase().includes('base')) {
      const box = new THREE.Box3().setFromObject(clone);
      const center = new THREE.Vector3();
      box.getCenter(center);
      clone.position.x -= center.x;
      clone.position.z -= center.z;
    }

    return clone;
  }, [scene, isPreview, url]);

  useEffect(() => {
    let hasFabricName = false;
    clonedScene.traverse((node) => {
      if (node.isMesh && node.material) {
        const name = (node.name + " " + (node.material.name || "")).toLowerCase();
        if (name.includes('fabric') || name.includes('szovet') || name.includes('szövet') || name.includes('textil') || name.includes('huzat')) {
          hasFabricName = true;
        }
      }
    });

    clonedScene.traverse((node) => {
      if (node.isMesh && node.material) {
        if (isPreview) {
          node.material.transparent = true;
          node.material.opacity = 0.5;
        } else {
          node.material.transparent = false;
          node.material.opacity = 1.0;
        }

        const name = (node.name + " " + (node.material.name || "")).toLowerCase();
        const isExplicitMetal = name.includes('metal') || name.includes('fém') || name.includes('fem') || name.includes('csavar') || name.includes('bolt') || name.includes('vas') || name.includes('leg') || name.includes('láb');
        const isExplicitFabric = name.includes('fabric') || name.includes('szovet') || name.includes('szövet') || name.includes('textil') || name.includes('huzat');
        
        const isFabric = isExplicitFabric || (!hasFabricName && !isExplicitMetal);

        if (isFabric) {
          node.material.color.set(color);
          if (isActive) {
            node.material.emissive = new THREE.Color("#A3A48C");
            node.material.emissiveIntensity = 0.35;
          } else if (isHovered) {
            node.material.emissive = new THREE.Color(color);
            node.material.emissiveIntensity = 0.2;
          } else {
            node.material.emissive = new THREE.Color(0x000000);
            node.material.emissiveIntensity = 0;
          }
        }
      }
    });
  }, [clonedScene, color, isActive, isHovered, isPreview]);

  return <primitive object={clonedScene} />;
}

export function SofaModule({ 
  moduleData, 
  fabricId, 
  onDragStart, 
  onDragEnd, 
  allModules, 
  updateModulePosition,
  updateModuleRotation,
  cleanUpArmrests,
  isActive,
  setActiveModule,
  updateModuleFabric,
  removeModule,
  isPreview = false,
}) {
  const moduleDef = modulesData.find(m => m.id === moduleData.moduleId);
  const fabricDef = fabricsData.find(f => f.id === fabricId);
  
  const width = moduleDef ? moduleDef.dimensions.width / 100 : 0.8;
  const height = moduleDef ? moduleDef.dimensions.height / 100 : 0.7;
  const depth = moduleDef ? moduleDef.dimensions.depth / 100 : 0.8;
  
  const color = fabricDef ? fabricDef.colorHex : '#cccccc';

  if (!moduleDef) return null;

  if (isPreview) {
    return (
      <group 
        position={moduleData.position} 
        rotation={moduleData.rotation || [0, 0, 0]}
      >
        {moduleDef.modelPath ? (
          <RealModel 
            url={getAssetUrl(moduleDef.modelPath)} 
            color={color} 
            isActive={false} 
            isHovered={false} 
            isPreview={true} 
          />
        ) : (
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial color={color} transparent opacity={0.5} />
          </mesh>
        )}
      </group>
    );
  }

  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const { raycaster, camera } = useThree();
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  
  const positionRef = useRef(new THREE.Vector3(...moduleData.position));
  const targetPositionRef = useRef(new THREE.Vector3(...moduleData.position));
  const dragOffsetRef = useRef(new THREE.Vector3(0, 0, 0));
  const rotationRef = useRef(new THREE.Vector3(...(moduleData.rotation || [0, 0, 0])));

  const attachedArmrestsRef = useRef([]);
  const dragStartPosRef = useRef(new THREE.Vector3());

  const checkSnap = (currentPos, currentRot) => {
    return checkModuleSnap(currentPos, currentRot, moduleDef, allModules, moduleData.instanceId);
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    e.stopPropagation();

    setActiveModule(moduleData.instanceId);
    setIsDragging(true);
    if (onDragStart) onDragStart();

    const intersection = new THREE.Vector3();
    raycaster.ray.intersectPlane(floorPlane, intersection);
    if (intersection) {
      dragOffsetRef.current.copy(intersection).sub(positionRef.current);
    }

    dragStartPosRef.current.copy(positionRef.current);

    if (moduleDef.type !== 'armrest') {
      const targetConnectorsWorld = moduleDef.connectors.map(c => {
        const localPos = new THREE.Vector3(c.position[0], c.position[1], c.position[2]);
        localPos.applyEuler(new THREE.Euler(...(moduleData.rotation || [0, 0, 0])));
        return localPos.add(new THREE.Vector3(...moduleData.position));
      });

      attachedArmrestsRef.current = [];
      allModules.forEach(mod => {
        if (mod.moduleId === 'armrest') {
          const armDef = modulesData.find(m => m.id === mod.moduleId);
          if (!armDef) return;
          const armConnectorsWorld = armDef.connectors.map(c => {
            const localPos = new THREE.Vector3(c.position[0], c.position[1], c.position[2]);
            localPos.applyEuler(new THREE.Euler(...(mod.rotation || [0, 0, 0])));
            return localPos.add(new THREE.Vector3(...mod.position));
          });

          for (let tc of targetConnectorsWorld) {
            for (let ac of armConnectorsWorld) {
              if (tc.distanceTo(ac) < 0.1) {
                attachedArmrestsRef.current.push({
                  instanceId: mod.instanceId,
                  relPos: new THREE.Vector3(...mod.position).sub(positionRef.current),
                });
                break;
              }
            }
          }
        }
      });
    }

    const handlePointerMove = () => {
      const currentIntersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(floorPlane, currentIntersection);
      if (currentIntersection) {
        const newPos = currentIntersection.sub(dragOffsetRef.current);
        newPos.y = 0;

        const snapResult = checkSnap(newPos, rotationRef.current.toArray());
        targetPositionRef.current.copy(snapResult.pos);
        positionRef.current.copy(snapResult.pos);

        if (moduleDef.type === 'armrest') {
          rotationRef.current.set(...snapResult.rot);
        }

        if (meshRef.current) {
          meshRef.current.position.copy(targetPositionRef.current);
          if (moduleDef.type === 'armrest') {
            meshRef.current.rotation.set(...rotationRef.current.toArray());
          }
        }
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      if (onDragEnd) onDragEnd();

      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);

      updateModulePosition(moduleData.instanceId, [
        targetPositionRef.current.x,
        targetPositionRef.current.y,
        targetPositionRef.current.z,
      ]);

      if (moduleDef.type === 'armrest') {
        updateModuleRotation(moduleData.instanceId, rotationRef.current.toArray());
      }

      if (cleanUpArmrests) cleanUpArmrests();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <group 
      ref={meshRef}
      position={moduleData.position} 
      rotation={moduleData.rotation || [0, 0, 0]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); }}
      onPointerDown={onPointerDown}
    >
      <group>
        {moduleDef.modelPath ? (
          <RealModel 
            url={getAssetUrl(moduleDef.modelPath)} 
            color={color} 
            isActive={isActive} 
            isHovered={hovered && !isDragging} 
          />
        ) : (
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width, height, depth]} />
            <meshStandardMaterial 
              color={color} 
              emissive={isActive ? "#A3A48C" : (hovered ? color : "#000000")}
              emissiveIntensity={isActive ? 0.3 : (hovered ? 0.2 : 0)}
            />
          </mesh>
        )}
      </group>

      {/* Context Menu for Active Module */}
      {isActive && (
        <Html position={[0, height + 0.3, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-white/95 backdrop-blur-md rounded-none shadow-[0_8px_24px_rgba(0,0,0,0.18)] border border-wbk-lightgrey/80 flex items-center py-2 px-3 gap-2.5 pointer-events-auto select-none">
            <div className="text-xs font-semibold text-wbk-black px-1" title={moduleDef.name}>
              {moduleDef.name}
            </div>
            
            <div className="w-[1px] h-5 bg-wbk-lightgrey"></div>
            
            <div className="flex gap-1.5 items-center">
              {fabricsData.map(f => (
                <button 
                  key={f.id}
                  className={`w-5 h-5 rounded-full border-2 cursor-pointer p-0 shadow-sm transition-transform duration-150 hover:scale-110 ${fabricId === f.id ? 'border-wbk-black scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: f.colorHex }}
                  onClick={(e) => {
                    e.stopPropagation();
                    updateModuleFabric(moduleData.instanceId, f.id);
                  }}
                  title={f.name}
                />
              ))}
            </div>

            <div className="w-[1px] h-5 bg-wbk-lightgrey"></div>
            
            <button 
              className="bg-transparent border-none text-wbk-brown cursor-pointer flex items-center p-1.5 rounded-full transition-colors hover:text-wbk-black hover:bg-wbk-lightgrey/50"
              onClick={(e) => {
                e.stopPropagation();
                const currentRot = moduleData.rotation || [0, 0, 0];
                const newY = (currentRot[1] + Math.PI / 2) % (Math.PI * 2);
                updateModuleRotation(moduleData.instanceId, [currentRot[0], newY, currentRot[2]]);
              }}
              title="Rotate 90°"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
            </button>

            <div className="w-[1px] h-5 bg-wbk-lightgrey"></div>
            
            <button 
              className="bg-transparent border-none text-wbk-brown cursor-pointer flex items-center p-1.5 rounded-full transition-colors hover:text-red-600 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                removeModule(moduleData.instanceId);
              }}
              title="Remove module"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}
