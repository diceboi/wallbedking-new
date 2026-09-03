"use client";

import React, { useRef } from 'react';
import { Html, Line } from '@react-three/drei';
import { modulesData } from './data/modules';
import { useSofaConfiguratorStore } from './store/useSofaConfiguratorStore';
import * as THREE from 'three';

function DimensionLine({ start, end, label, tickSize = 0.05 }) {
  const p1 = start;
  const p2 = end;
  
  const center = [
    (p1[0] + p2[0]) / 2,
    (p1[1] + p2[1]) / 2,
    (p1[2] + p2[2]) / 2,
  ];

  const isX = p1[0] !== p2[0];
  const isY = p1[1] !== p2[1];
  const isZ = p1[2] !== p2[2];

  const tick1Start = [...p1];
  const tick1End = [...p1];
  const tick2Start = [...p2];
  const tick2End = [...p2];

  if (isX) {
    tick1Start[2] -= tickSize; tick1End[2] += tickSize;
    tick2Start[2] -= tickSize; tick2End[2] += tickSize;
  } else if (isZ) {
    tick1Start[0] -= tickSize; tick1End[0] += tickSize;
    tick2Start[0] -= tickSize; tick2End[0] += tickSize;
  } else if (isY) {
    tick1Start[0] -= tickSize; tick1End[0] += tickSize;
    tick2Start[0] -= tickSize; tick2End[0] += tickSize;
  }

  const labelRef = useRef(null);

  const handleOcclude = (hidden) => {
    if (labelRef.current) {
      labelRef.current.style.opacity = hidden ? '0.2' : '1';
    }
  };

  return (
    <group>
      <Line points={[p1, p2]} color="#090A0A" lineWidth={2} raycast={() => null} />
      <Line points={[tick1Start, tick1End]} color="#090A0A" lineWidth={2} raycast={() => null} />
      <Line points={[tick2Start, tick2End]} color="#090A0A" lineWidth={2} raycast={() => null} />

      <Html position={center} center zIndexRange={[100, 0]} occlude onOcclude={handleOcclude}>
        <div 
          ref={labelRef}
          className="bg-wbk-black text-white px-2 py-0.5 rounded-none text-xs font-semibold whitespace-nowrap pointer-events-none shadow-md select-none transition-opacity duration-200"
        >
          {label} cm
        </div>
      </Html>
    </group>
  );
}

export function DimensionsOverlay() {
  const selectedModules = useSofaConfiguratorStore(state => state.selectedModules);

  if (!selectedModules || selectedModules.length === 0) return null;

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  selectedModules.forEach(mod => {
    const def = modulesData.find(m => m.id === mod.moduleId);
    if (!def) return;

    const rotationY = mod.rotation ? mod.rotation[1] : 0;
    const isRotated = Math.abs(Math.sin(rotationY)) > 0.7;
    const w = isRotated ? def.dimensions.depth / 100 : def.dimensions.width / 100;
    const h = def.dimensions.height / 100;
    const d = isRotated ? def.dimensions.width / 100 : def.dimensions.depth / 100;
    
    let xOffset = 0;
    let zOffset = 0;
    if (def.type === 'seat') {
      const offsetVector = new THREE.Vector3(0, 0, -0.05);
      offsetVector.applyEuler(new THREE.Euler(0, rotationY, 0));
      xOffset = offsetVector.x;
      zOffset = offsetVector.z;
    }

    const x = mod.position[0] + xOffset;
    const y = mod.position[1];
    const z = mod.position[2] + zOffset;

    minX = Math.min(minX, x - w / 2);
    maxX = Math.max(maxX, x + w / 2);
    minY = 0;
    maxY = Math.max(maxY, h);
    minZ = Math.min(minZ, z - d / 2);
    maxZ = Math.max(maxZ, z + d / 2);
  });

  const widthCm = Math.round((maxX - minX) * 100);
  const depthCm = Math.round((maxZ - minZ) * 100);
  const heightCm = Math.round((maxY - minY) * 100);

  const offset = 0.2;

  const widthStart = [minX, minY, maxZ + offset];
  const widthEnd = [maxX, minY, maxZ + offset];

  const depthStart = [maxX + offset, minY, minZ];
  const depthEnd = [maxX + offset, minY, maxZ];

  const heightStart = [maxX + offset, minY, minZ - offset];
  const heightEnd = [maxX + offset, maxY, minZ - offset];

  return (
    <group>
      <DimensionLine start={widthStart} end={widthEnd} label={widthCm} />
      <DimensionLine start={depthStart} end={depthEnd} label={depthCm} />
      <DimensionLine start={heightStart} end={heightEnd} label={heightCm} />
    </group>
  );
}
