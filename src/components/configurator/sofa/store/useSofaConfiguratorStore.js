import { create } from 'zustand';
import { modulesData } from '../data/modules';
import { fabricsData } from '../data/fabrics';
import * as THREE from 'three';

function calculateTotal(modules, fabricId) {
  const fabricDef = fabricsData.find(f => f.id === fabricId);
  const fabricModifier = fabricDef ? fabricDef.priceModifier || 0 : 0;

  return modules.reduce((total, mod) => {
    const moduleDef = modulesData.find(m => m.id === mod.moduleId);
    const modPrice = moduleDef ? moduleDef.price : 0;
    const itemFabricDef = mod.fabricId ? fabricsData.find(f => f.id === mod.fabricId) : fabricDef;
    const itemFabricModifier = itemFabricDef ? itemFabricDef.priceModifier || 0 : fabricModifier;

    return total + modPrice + itemFabricModifier;
  }, 0);
}

export const useSofaConfiguratorStore = create((set, get) => ({
  selectedModules: [],
  selectedFabric: 'beige',
  totalPrice: 0,
  activeModuleId: null,
  previewModule: null, // { moduleId, position, rotation }
  showDimensions: true,

  toggleDimensions: () => set((state) => ({ showDimensions: !state.showDimensions })),
  setActiveModule: (instanceId) => set({ activeModuleId: instanceId }),
  setPreviewModule: (preview) => set({ previewModule: preview }),

  addModuleAtPosition: (moduleId, position, rotation = [0, 0, 0]) => {
    const moduleDef = modulesData.find(m => m.id === moduleId);
    if (!moduleDef) return;

    set((state) => {
      const newModule = {
        instanceId: `${moduleId}-${Date.now()}`,
        moduleId: moduleId,
        position: position,
        rotation: rotation,
        fabricId: state.selectedFabric,
      };

      const newModules = [...state.selectedModules, newModule];
      
      return {
        selectedModules: newModules,
        totalPrice: calculateTotal(newModules, state.selectedFabric),
      };
    });

    get().cleanUpArmrests();
  },

  addModule: (moduleId) => {
    const moduleDef = modulesData.find(m => m.id === moduleId);
    if (!moduleDef) return;

    set((state) => {
      let newX = 0;
      let newY = 0;
      let newZ = 0;
      let newRot = [0, 0, 0];
      if (moduleDef.id === 'seat-base-600' || moduleDef.id === 'seat-base-800') {
        newRot = [0, Math.PI / 2, 0];
      }

      if (state.selectedModules.length > 0) {
        // Find all existing connectors in world space
        const allExistingConnectors = [];
        state.selectedModules.forEach(mod => {
          const def = modulesData.find(m => m.id === mod.moduleId);
          if (!def) return;
          const rot = mod.rotation || [0, 0, 0];
          
          def.connectors.forEach(c => {
            const localPos = new THREE.Vector3(c.position[0], c.position[1], c.position[2]);
            localPos.applyEuler(new THREE.Euler(rot[0], rot[1], rot[2]));
            allExistingConnectors.push({
              ...c,
              moduleId: mod.instanceId,
              moduleRot: rot,
              worldPos: localPos.add(new THREE.Vector3(...mod.position)),
            });
          });
        });
        
        // Filter out occupied connectors
        const openConnectors = allExistingConnectors.filter(c1 => {
          return !allExistingConnectors.some(c2 => 
            c1.moduleId !== c2.moduleId && c1.worldPos.distanceTo(c2.worldPos) < 0.1
          );
        });
        
        // Prioritize right-side connections
        openConnectors.sort((a, b) => {
          if (a.id.includes('right')) return -1;
          if (b.id.includes('right')) return 1;
          if (a.id.includes('left')) return -1;
          if (b.id.includes('left')) return 1;
          return 0;
        });

        const getConnectorAngle = (id) => {
          if (id.includes('left')) return Math.PI;
          if (id.includes('right')) return 0;
          if (id.includes('front')) return -Math.PI / 2;
          if (id.includes('back')) return Math.PI / 2;
          if (id === 'arm-side') return 0;
          return 0;
        };

        let foundSnap = false;

        for (let existingConn of openConnectors) {
          for (let newConn of moduleDef.connectors) {
            if (existingConn.accepts.includes(newConn.id) || newConn.accepts.includes(existingConn.id)) {
              const existingWorldAngle = existingConn.moduleRot[1] + getConnectorAngle(existingConn.id);
              const newConnAngle = getConnectorAngle(newConn.id);
              
              let targetRotY = existingWorldAngle + Math.PI - newConnAngle;
              targetRotY = (targetRotY % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
              
              if (moduleDef.id === 'seat-base-600' || moduleDef.id === 'seat-base-800') {
                const is90 = Math.abs(targetRotY - Math.PI / 2) < 0.01;
                const is270 = Math.abs(targetRotY - 3 * Math.PI / 2) < 0.01;
                if (!is90 && !is270) continue;
              }

              const targetRot = [0, targetRotY, 0];
              const localPosRotated = new THREE.Vector3(newConn.position[0], newConn.position[1], newConn.position[2]);
              localPosRotated.applyEuler(new THREE.Euler(targetRot[0], targetRot[1], targetRot[2]));
              const targetPos = existingConn.worldPos.clone().sub(localPosRotated);
              
              newX = targetPos.x;
              newY = targetPos.y;
              newZ = targetPos.z;
              newRot = targetRot;
              foundSnap = true;
              break;
            }
          }
          if (foundSnap) break;
        }

        if (!foundSnap) {
          const lastMod = state.selectedModules[state.selectedModules.length - 1];
          const lastDef = modulesData.find(m => m.id === lastMod.moduleId);
          let gap = 0;
          if (lastDef && (lastDef.type === 'seat' || lastDef.type === 'base')) gap += 0.006;
          if (moduleDef.type === 'seat' || moduleDef.type === 'base') gap += 0.006;
          const lastWidth = lastDef ? lastDef.dimensions.width / 100 : 0.8;
          const newWidth = moduleDef.dimensions.width / 100;
          
          newX = lastMod.position[0] + (lastWidth / 2) + (newWidth / 2) + gap;
          newZ = lastMod.position[2];
          newRot = [0, 0, 0];
          if (moduleDef.id === 'seat-base-600' || moduleDef.id === 'seat-base-800') {
            newRot = [0, Math.PI / 2, 0];
          }
        }
      }

      const newModule = {
        instanceId: `${moduleId}-${Date.now()}`,
        moduleId: moduleId,
        position: [newX, newY, newZ],
        rotation: newRot,
        fabricId: state.selectedFabric,
      };

      const newModules = [...state.selectedModules, newModule];
      
      return {
        selectedModules: newModules,
        totalPrice: calculateTotal(newModules, state.selectedFabric),
      };
    });
    
    get().cleanUpArmrests();
  },

  removeModule: (instanceId) => {
    set((state) => {
      const newModules = state.selectedModules.filter(m => m.instanceId !== instanceId);
      return {
        selectedModules: newModules,
        totalPrice: calculateTotal(newModules, state.selectedFabric),
      };
    });
  },

  updateModulePosition: (instanceId, newPosition) => {
    set((state) => {
      const targetModule = state.selectedModules.find(m => m.instanceId === instanceId);
      if (!targetModule) return state;

      const targetDef = modulesData.find(m => m.id === targetModule.moduleId);
      if (!targetDef) return state;

      const dx = newPosition[0] - targetModule.position[0];
      const dy = newPosition[1] - targetModule.position[1];
      const dz = newPosition[2] - targetModule.position[2];

      if (dx === 0 && dy === 0 && dz === 0) return state;

      const attachedArmrestIds = [];
      if (targetDef.type !== 'armrest') {
        const targetConnectorsWorld = targetDef.connectors.map(c => {
          const localPos = new THREE.Vector3(c.position[0], c.position[1], c.position[2]);
          localPos.applyEuler(new THREE.Euler(...(targetModule.rotation || [0,0,0])));
          return localPos.add(new THREE.Vector3(...targetModule.position));
        });

        state.selectedModules.forEach(mod => {
          if (mod.moduleId === 'armrest') {
            const armDef = modulesData.find(m => m.id === mod.moduleId);
            if (!armDef) return;
            const armConnectorsWorld = armDef.connectors.map(c => {
              const localPos = new THREE.Vector3(c.position[0], c.position[1], c.position[2]);
              localPos.applyEuler(new THREE.Euler(...(mod.rotation || [0,0,0])));
              return localPos.add(new THREE.Vector3(...mod.position));
            });

            let attached = false;
            for (let tc of targetConnectorsWorld) {
              for (let ac of armConnectorsWorld) {
                if (tc.distanceTo(ac) < 0.1) {
                  attached = true;
                  break;
                }
              }
              if (attached) break;
            }
            if (attached) attachedArmrestIds.push(mod.instanceId);
          }
        });
      }

      return {
        selectedModules: state.selectedModules.map(m => {
          if (m.instanceId === instanceId) {
            return { ...m, position: newPosition };
          }
          if (attachedArmrestIds.includes(m.instanceId)) {
            return { ...m, position: [m.position[0] + dx, m.position[1] + dy, m.position[2] + dz] };
          }
          return m;
        }),
      };
    });
  },

  updateModuleRotation: (instanceId, newRotation) => {
    set((state) => {
      const targetModule = state.selectedModules.find(m => m.instanceId === instanceId);
      if (!targetModule) return state;

      const targetDef = modulesData.find(m => m.id === targetModule.moduleId);
      if (!targetDef) return state;

      const dyAngle = newRotation[1] - (targetModule.rotation ? targetModule.rotation[1] : 0);
      if (dyAngle === 0) return state;

      const attachedArmrests = [];
      if (targetDef.type !== 'armrest') {
        const targetConnectorsWorld = targetDef.connectors.map(c => {
          const localPos = new THREE.Vector3(c.position[0], c.position[1], c.position[2]);
          localPos.applyEuler(new THREE.Euler(...(targetModule.rotation || [0,0,0])));
          return localPos.add(new THREE.Vector3(...targetModule.position));
        });

        state.selectedModules.forEach(mod => {
          if (mod.moduleId === 'armrest') {
            const armDef = modulesData.find(m => m.id === mod.moduleId);
            if (!armDef) return;
            const armConnectorsWorld = armDef.connectors.map(c => {
              const localPos = new THREE.Vector3(c.position[0], c.position[1], c.position[2]);
              localPos.applyEuler(new THREE.Euler(...(mod.rotation || [0,0,0])));
              return localPos.add(new THREE.Vector3(...mod.position));
            });

            let attached = false;
            for (let tc of targetConnectorsWorld) {
              for (let ac of armConnectorsWorld) {
                if (tc.distanceTo(ac) < 0.1) {
                  attached = true;
                  break;
                }
              }
              if (attached) break;
            }
            if (attached) attachedArmrests.push(mod);
          }
        });
      }

      return {
        selectedModules: state.selectedModules.map(m => {
          if (m.instanceId === instanceId) {
            return { ...m, rotation: newRotation };
          }
          const attachedArmrest = attachedArmrests.find(a => a.instanceId === m.instanceId);
          if (attachedArmrest) {
            const origin = new THREE.Vector3(...targetModule.position);
            const armPos = new THREE.Vector3(...attachedArmrest.position);
            
            armPos.sub(origin);
            armPos.applyAxisAngle(new THREE.Vector3(0, 1, 0), dyAngle);
            armPos.add(origin);

            const newRot = [
              attachedArmrest.rotation ? attachedArmrest.rotation[0] : 0,
              (attachedArmrest.rotation ? attachedArmrest.rotation[1] : 0) + dyAngle,
              attachedArmrest.rotation ? attachedArmrest.rotation[2] : 0,
            ];

            return { ...m, position: [armPos.x, armPos.y, armPos.z], rotation: newRot };
          }
          return m;
        }),
      };
    });
  },

  cleanUpArmrests: () => {
    set((state) => {
      const seats = state.selectedModules.filter(m => m.moduleId !== 'armrest');
      const armrests = state.selectedModules.filter(m => m.moduleId === 'armrest');
      
      if (seats.length < 2 || armrests.length === 0) return state;

      const connections = [];
      for (let i = 0; i < seats.length; i++) {
        for (let j = i + 1; j < seats.length; j++) {
          const dx = seats[i].position[0] - seats[j].position[0];
          const dz = seats[i].position[2] - seats[j].position[2];
          const dist = Math.sqrt(dx * dx + dz * dz);
          
          const defI = modulesData.find(m => m.id === seats[i].moduleId);
          const defJ = modulesData.find(m => m.id === seats[j].moduleId);
          if (!defI || !defJ) continue;

          let overhang = 0;
          if (defI.type === 'seat' || defI.type === 'base') overhang += 0.006;
          if (defJ.type === 'seat' || defJ.type === 'base') overhang += 0.006;

          const expectedDist = (defI.dimensions.width + defJ.dimensions.width) / 200 + overhang;
          if (dist > expectedDist - 0.05 && dist < expectedDist + 0.05) {
            const midX = (seats[i].position[0] + seats[j].position[0]) / 2;
            const midZ = (seats[i].position[2] + seats[j].position[2]) / 2;
            connections.push({ x: midX, z: midZ });
          }
        }
      }
      
      if (connections.length === 0) return state;

      const toRemove = armrests.filter(arm => {
        return connections.some(mid => {
          const dx = arm.position[0] - mid.x;
          const dz = arm.position[2] - mid.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          return dist < 0.3;
        });
      }).map(m => m.instanceId);
      
      if (toRemove.length === 0) return state;
      
      const newModules = state.selectedModules.filter(m => !toRemove.includes(m.instanceId));
      return {
        selectedModules: newModules,
        totalPrice: calculateTotal(newModules, state.selectedFabric),
      };
    });
  },

  updateModuleFabric: (instanceId, fabricId) => {
    set((state) => {
      const newModules = state.selectedModules.map(m => 
        m.instanceId === instanceId ? { ...m, fabricId } : m
      );
      return {
        selectedModules: newModules,
        totalPrice: calculateTotal(newModules, state.selectedFabric),
      };
    });
  },

  updateFabric: (fabricId) => {
    set((state) => {
      const newModules = state.selectedModules.map(m => ({ ...m, fabricId }));
      return {
        selectedFabric: fabricId,
        selectedModules: newModules,
        totalPrice: calculateTotal(newModules, fabricId),
      };
    });
  },

  resetConfiguration: () => {
    set({ selectedModules: [], totalPrice: 0 });
  },
  
  exportConfiguration: () => {
    const state = get();
    if (typeof window === 'undefined') return '';
    const compressed = {
      m: state.selectedModules.map(m => ({
        i: m.instanceId,
        d: m.moduleId,
        p: [Number(m.position[0].toFixed(3)), Number(m.position[1].toFixed(3)), Number(m.position[2].toFixed(3))],
        r: [Number(m.rotation[0].toFixed(3)), Number(m.rotation[1].toFixed(3)), Number(m.rotation[2].toFixed(3))],
        f: m.fabricId,
      })),
      f: state.selectedFabric,
    };
    try {
      return btoa(JSON.stringify(compressed));
    } catch {
      return '';
    }
  },

  loadConfiguration: (base64Config) => {
    if (typeof window === 'undefined') return false;
    try {
      const decoded = JSON.parse(atob(base64Config));
      const newModules = decoded.m.map(m => ({
        instanceId: m.i,
        moduleId: m.d,
        position: m.p,
        rotation: m.r,
        fabricId: m.f || decoded.f,
      }));
      set({
        selectedModules: newModules,
        selectedFabric: decoded.f,
        totalPrice: calculateTotal(newModules, decoded.f),
      });
      return true;
    } catch (e) {
      console.error("Failed to load configuration from URL", e);
      return false;
    }
  },
}));
