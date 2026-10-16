import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { CustomSkin, GameMode, SkinId } from '../../types/game';
import { SKINS_CATALOG, getSkin } from '../../utils/skins';
import { AnimeCharacter } from './CharacterModel';
import { sound } from '../../utils/audio';

interface OpenWorldSceneProps {
  equippedSkin: CustomSkin;
  unlockedSkinIds: SkinId[];
  onEquipSkin: (skinId: SkinId) => void;
  onStartTrial: (mode: GameMode) => void;
  onInspectSkin: (skin: CustomSkin) => void;
}

interface InteractivePoint {
  id: string;
  type: 'skin_pedestal' | 'trial_altar';
  name: string;
  position: THREE.Vector3;
  skinId?: SkinId;
  trialMode?: GameMode;
  color: string;
  isUnlocked?: boolean;
}

export const OpenWorldScene: React.FC<OpenWorldSceneProps> = ({
  equippedSkin,
  unlockedSkinIds,
  onEquipSkin,
  onStartTrial,
  onInspectSkin,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Active interaction near player
  const [nearbyPoint, setNearbyPoint] = useState<InteractivePoint | null>(null);
  const [isDodging, setIsDodging] = useState<boolean>(false);
  const [dodgeMessage, setDodgeMessage] = useState<string>('');

  // Refs for loop
  const playerRef = useRef<AnimeCharacter | null>(null);
  const keysPressed = useRef<Record<string, boolean>>({});
  const mouseDragRef = useRef<{ isDragging: boolean; lastX: number; lastY: number; cameraAngle: number; cameraPitch: number }>({
    isDragging: false,
    lastX: 0,
    lastY: 0,
    cameraAngle: 0,
    cameraPitch: 0.35,
  });

  const touchMoveRef = useRef<{ active: boolean; dx: number; dy: number }>({
    active: false,
    dx: 0,
    dy: 0,
  });

  // Handle Dodge Trigger
  const triggerDodgeAction = useCallback(() => {
    if (!playerRef.current || isDodging) return;
    setIsDodging(true);
    sound.playDodgeSwoosh();
    sound.triggerHaptic('signal');
    setDodgeMessage('SHADOW DASH EXECUTED');

    setTimeout(() => {
      setIsDodging(false);
      setDodgeMessage('');
    }, 450);
  }, [isDodging]);

  // Handle Attack Slash Trigger
  const triggerSlashAction = useCallback(() => {
    if (!playerRef.current) return;
    playerRef.current.triggerSlash();
    sound.playSignalFlash();
  }, []);

  // Handle Interaction Trigger
  const triggerInteractAction = useCallback(() => {
    if (!nearbyPoint) return;
    if (nearbyPoint.type === 'skin_pedestal' && nearbyPoint.skinId) {
      const skin = getSkin(nearbyPoint.skinId);
      onInspectSkin(skin);
    } else if (nearbyPoint.type === 'trial_altar' && nearbyPoint.trialMode) {
      onStartTrial(nearbyPoint.trialMode);
    }
  }, [nearbyPoint, onInspectSkin, onStartTrial]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#05070B');
    scene.fog = new THREE.FogExp2('#05070B', 0.035);

    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      150
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);

    // 2. Lighting Setup
    const ambientLight = new THREE.AmbientLight('#1E293B', 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#F8FAFC', 1.8);
    dirLight.position.set(15, 25, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 60;
    dirLight.shadow.camera.left = -25;
    dirLight.shadow.camera.right = 25;
    dirLight.shadow.camera.top = 25;
    dirLight.shadow.camera.bottom = -25;
    scene.add(dirLight);

    // Cyan & Violet rim lights
    const rimLight1 = new THREE.PointLight('#06B6D4', 3.5, 40);
    rimLight1.position.set(-15, 8, -10);
    scene.add(rimLight1);

    const rimLight2 = new THREE.PointLight('#8B5CF6', 3.5, 40);
    rimLight2.position.set(15, 8, -10);
    scene.add(rimLight2);

    // 3. Ground Arena Floor
    const floorGeo = new THREE.PlaneGeometry(90, 90, 32, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#080D18',
      roughness: 0.25,
      metalness: 0.85,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid Floor Overlay
    const gridHelper = new THREE.GridHelper(90, 45, '#06B6D4', '#1E293B');
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Concentric Arena Rings
    const ringMat = new THREE.MeshBasicMaterial({ color: '#06B6D4', transparent: true, opacity: 0.4 });
    const ring1 = new THREE.Mesh(new THREE.RingGeometry(18, 18.25, 64), ringMat);
    ring1.rotation.x = -Math.PI / 2;
    ring1.position.y = 0.02;
    scene.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.RingGeometry(8, 8.2, 64), ringMat);
    ring2.rotation.x = -Math.PI / 2;
    ring2.position.y = 0.02;
    scene.add(ring2);

    // 4. Cyber Torii Gate / Portal at North
    const toriiGroup = new THREE.Group();
    toriiGroup.position.set(0, 0, -26);

    const pillarMat = new THREE.MeshStandardMaterial({
      color: '#0F172A',
      emissive: '#06B6D4',
      emissiveIntensity: 0.2,
      roughness: 0.3,
      metalness: 0.8,
    });

    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 8, 0.8), pillarMat);
    leftPillar.position.set(-6, 4, 0);
    toriiGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 8, 0.8), pillarMat);
    rightPillar.position.set(6, 4, 0);
    toriiGroup.add(rightPillar);

    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(15, 0.9, 1), pillarMat);
    topBeam.position.set(0, 7.8, 0);
    toriiGroup.add(topBeam);

    const neonTop = new THREE.Mesh(
      new THREE.BoxGeometry(15.2, 0.15, 1.1),
      new THREE.MeshBasicMaterial({ color: '#06B6D4' })
    );
    neonTop.position.set(0, 8.3, 0);
    toriiGroup.add(neonTop);

    scene.add(toriiGroup);

    // 5. Environmental Cyber Columns / Monoliths
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = 32;
      const colX = Math.cos(angle) * dist;
      const colZ = Math.sin(angle) * dist;

      const colGeo = new THREE.BoxGeometry(1.5, 12, 1.5);
      const col = new THREE.Mesh(colGeo, pillarMat);
      col.position.set(colX, 6, colZ);
      col.castShadow = true;
      scene.add(col);

      const colLight = new THREE.PointLight(i % 2 === 0 ? '#06B6D4' : '#8B5CF6', 1, 8);
      colLight.position.set(colX, 10, colZ);
      scene.add(colLight);
    }

    // 6. Floating Digital Particles in sky
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 200;
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 60;
      posArray[i + 1] = Math.random() * 20 + 1;
      posArray[i + 2] = (Math.random() - 0.5) * 60;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      color: '#38BDF8',
      transparent: true,
      opacity: 0.7,
    });
    const particlesMesh = new THREE.Points(particleGeo, particleMat);
    scene.add(particlesMesh);

    // 7. Interactive Points Array
    const interactionPoints: InteractivePoint[] = [];

    // 8. Hall of Champions: 6 Skin Pedestals (Semi-circle at West)
    const pedestalCharacters: AnimeCharacter[] = [];
    const skinList = SKINS_CATALOG;
    const pedestalRadius = 14;

    skinList.forEach((skin, idx) => {
      // Position along an arc on the west side
      const angle = Math.PI * 0.75 + (idx / (skinList.length - 1)) * (Math.PI * 0.5);
      const px = Math.cos(angle) * pedestalRadius;
      const pz = Math.sin(angle) * pedestalRadius;

      // Base Pedestal
      const baseGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.6, 24);
      const baseMat = new THREE.MeshStandardMaterial({
        color: '#0F172A',
        roughness: 0.3,
        metalness: 0.8,
      });
      const pedestal = new THREE.Mesh(baseGeo, baseMat);
      pedestal.position.set(px, 0.3, pz);
      pedestal.receiveShadow = true;
      scene.add(pedestal);

      // Glowing Rim on Pedestal
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(1.22, 0.05, 8, 32),
        new THREE.MeshBasicMaterial({ color: skin.primaryColor })
      );
      rim.rotation.x = -Math.PI / 2;
      rim.position.set(px, 0.6, pz);
      scene.add(rim);

      // 3D Character Model on Pedestal
      const charModel = new AnimeCharacter(skin, true);
      charModel.group.position.set(px, 0.6, pz);
      // Face towards center
      charModel.group.rotation.y = -angle + Math.PI / 2;
      scene.add(charModel.group);
      pedestalCharacters.push(charModel);

      // Point Light on Pedestal
      const pLight = new THREE.PointLight(skin.primaryColor, 1.2, 5);
      pLight.position.set(px, 2.2, pz);
      scene.add(pLight);

      interactionPoints.push({
        id: `pedestal_${skin.id}`,
        type: 'skin_pedestal',
        name: skin.name,
        position: new THREE.Vector3(px, 0.6, pz),
        skinId: skin.id,
        color: skin.primaryColor,
        isUnlocked: unlockedSkinIds.includes(skin.id),
      });
    });

    // 9. Trial Altars (East side)
    const trials: Array<{ mode: GameMode; name: string; color: string; angle: number }> = [
      { mode: 'classic', name: 'Classic Reflex Shrine', color: '#06B6D4', angle: -0.25 },
      { mode: 'color', name: 'Discrimination Trial', color: '#8B5CF6', angle: 0.1 },
      { mode: 'direction', name: 'Directional Trial', color: '#38BDF8', angle: 0.45 },
      { mode: 'hardcore', name: 'Hardcore Master Shrine', color: '#EF4444', angle: 0.8 },
    ];

    trials.forEach((trial) => {
      const ax = Math.cos(trial.angle) * pedestalRadius;
      const az = Math.sin(trial.angle) * pedestalRadius;

      // Altar structure
      const altarGeo = new THREE.BoxGeometry(1.6, 1.2, 1.6);
      const altarMat = new THREE.MeshStandardMaterial({
        color: '#0F172A',
        roughness: 0.2,
        metalness: 0.9,
      });
      const altar = new THREE.Mesh(altarGeo, altarMat);
      altar.position.set(ax, 0.6, az);
      scene.add(altar);

      // Floating holographic orb above altar
      const orbGeo = new THREE.OctahedronGeometry(0.45, 0);
      const orbMat = new THREE.MeshStandardMaterial({
        color: trial.color,
        emissive: trial.color,
        emissiveIntensity: 1.2,
        wireframe: true,
      });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.set(ax, 2.2, az);
      scene.add(orb);

      // Store orb reference for animation
      (altar as unknown as { orbMesh: THREE.Mesh }).orbMesh = orb;

      const aLight = new THREE.PointLight(trial.color, 1.8, 6);
      aLight.position.set(ax, 2.2, az);
      scene.add(aLight);

      interactionPoints.push({
        id: `trial_${trial.mode}`,
        type: 'trial_altar',
        name: trial.name,
        position: new THREE.Vector3(ax, 0.6, az),
        trialMode: trial.mode,
        color: trial.color,
      });
    });

    // 10. Player Character
    const player = new AnimeCharacter(equippedSkin, false);
    player.group.position.set(0, 0, 4);
    scene.add(player.group);
    playerRef.current = player;

    // Movement variables
    const playerSpeed = 8.5;
    const playerPos = new THREE.Vector3(0, 0, 4);
    let playerRotationY = 0;

    // 11. Input Handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;

      if (e.code === 'KeyE') {
        triggerInteractAction();
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        triggerDodgeAction();
      } else if (e.code === 'Space') {
        // If near trial, Space starts trial, otherwise slashes blade!
        if (nearbyPoint && nearbyPoint.type === 'trial_altar') {
          triggerInteractAction();
        } else {
          triggerSlashAction();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Mouse drag for camera orbit
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        mouseDragRef.current.isDragging = true;
        mouseDragRef.current.lastX = e.clientX;
        mouseDragRef.current.lastY = e.clientY;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseDragRef.current.isDragging) return;
      const dx = e.clientX - mouseDragRef.current.lastX;
      const dy = e.clientY - mouseDragRef.current.lastY;
      mouseDragRef.current.lastX = e.clientX;
      mouseDragRef.current.lastY = e.clientY;

      mouseDragRef.current.cameraAngle -= dx * 0.006;
      mouseDragRef.current.cameraPitch = Math.max(
        0.1,
        Math.min(0.9, mouseDragRef.current.cameraPitch + dy * 0.004)
      );
    };

    const handleMouseUp = () => {
      mouseDragRef.current.isDragging = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 12. Main Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // Animate floating sky particles
      particlesMesh.rotation.y = time * 0.03;

      // Animate Pedestal characters (gentle hovering / slow rotation)
      pedestalCharacters.forEach((char, idx) => {
        char.group.position.y = 0.6 + Math.sin(time * 2 + idx) * 0.04;
        char.update(delta, false, false);
      });

      // Calculate player movement vector
      let moveX = 0;
      let moveZ = 0;

      if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) moveZ -= 1;
      if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) moveZ += 1;
      if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) moveX -= 1;
      if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) moveX += 1;

      // Virtual touch joystick input
      if (touchMoveRef.current.active) {
        moveX += touchMoveRef.current.dx;
        moveZ += touchMoveRef.current.dy;
      }

      const inputLen = Math.hypot(moveX, moveZ);
      const isMoving = inputLen > 0.1;

      if (isMoving) {
        // Normalize
        const nx = moveX / inputLen;
        const nz = moveZ / inputLen;

        // Apply camera relative orientation
        const camAngle = mouseDragRef.current.cameraAngle;
        const dirX = nx * Math.cos(camAngle) - nz * Math.sin(camAngle);
        const dirZ = nx * Math.sin(camAngle) + nz * Math.cos(camAngle);

        const currentSpeed = isDodging ? playerSpeed * 2.2 : playerSpeed;

        playerPos.x += dirX * currentSpeed * delta;
        playerPos.z += dirZ * currentSpeed * delta;

        // Boundary constraint
        const maxDist = 34;
        if (playerPos.length() > maxDist) {
          playerPos.setLength(maxDist);
        }

        // Face movement direction
        const targetRot = Math.atan2(dirX, dirZ);
        playerRotationY = THREE.MathUtils.lerp(playerRotationY, targetRot, 0.2);
      }

      player.group.position.copy(playerPos);
      player.group.rotation.y = playerRotationY;
      player.update(delta, isMoving, isDodging);

      // Camera Third-Person Chase Camera
      const camDist = isDodging ? 8.5 : 7.2;
      const camHeight = 3.2 + mouseDragRef.current.cameraPitch * 3;
      const camX = playerPos.x + Math.sin(mouseDragRef.current.cameraAngle) * camDist;
      const camZ = playerPos.z + Math.cos(mouseDragRef.current.cameraAngle) * camDist;

      camera.position.lerp(new THREE.Vector3(camX, camHeight, camZ), 0.12);
      camera.lookAt(playerPos.x, playerPos.y + 1.4, playerPos.z);

      // Proximity check for interaction points
      let closest: InteractivePoint | null = null;
      let minDistance = 3.2;

      for (const pt of interactionPoints) {
        const d = playerPos.distanceTo(pt.position);
        if (d < minDistance) {
          closest = pt;
          minDistance = d;
        }
      }

      setNearbyPoint(closest);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [equippedSkin, unlockedSkinIds, isDodging, triggerDodgeAction, triggerSlashAction, triggerInteractAction]);

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1 overflow-hidden select-none">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Proximity Interaction Prompt Banner */}
      {nearbyPoint && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 px-5 py-3 rounded-2xl bg-neutral-900/90 border border-neutral-700 shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center gap-3 animate-bounce">
          <div
            className="w-3 h-3 rounded-full animate-ping"
            style={{ backgroundColor: nearbyPoint.color }}
          />
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              {nearbyPoint.type === 'skin_pedestal' ? 'Skin Showcase Pedestal' : 'Reflex Trial Altar'}
            </div>
            <div className="text-sm font-extrabold text-white font-display">
              {nearbyPoint.name}
            </div>
          </div>

          <button
            onClick={triggerInteractAction}
            className="ml-2 px-3.5 py-1.5 rounded-xl font-display font-bold text-xs bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            {nearbyPoint.type === 'skin_pedestal' ? '[E] Inspect & Equip' : '[SPACE] Enter Trial'}
          </button>
        </div>
      )}

      {/* Dodge Status Notification */}
      {dodgeMessage && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20 text-xs font-mono font-bold px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-400 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.6)] animate-pulse">
          {dodgeMessage}
        </div>
      )}

      {/* On-Screen Mobile Action Buttons */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
        <button
          onClick={triggerDodgeAction}
          className="w-14 h-14 rounded-2xl bg-neutral-900/90 border border-purple-500/70 text-purple-300 font-display font-bold text-xs flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
        >
          <span>DODGE</span>
          <span className="text-[9px] text-neutral-500 font-mono">SHIFT</span>
        </button>

        <button
          onClick={triggerSlashAction}
          className="w-14 h-14 rounded-2xl bg-neutral-900/90 border border-cyan-500/70 text-cyan-300 font-display font-bold text-xs flex flex-col items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
        >
          <span>SLASH</span>
          <span className="text-[9px] text-neutral-500 font-mono">SPACE</span>
        </button>

        {nearbyPoint && (
          <button
            onClick={triggerInteractAction}
            className="w-14 h-14 rounded-2xl bg-cyan-400 text-black font-display font-extrabold text-xs flex flex-col items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.8)] active:scale-90 transition-transform cursor-pointer animate-pulse"
          >
            <span>INTERACT</span>
            <span className="text-[9px] font-mono">[E]</span>
          </button>
        )}
      </div>

      {/* Bottom Controls Legend */}
      <div className="absolute bottom-4 left-6 z-20 hidden sm:flex items-center gap-3 text-[11px] font-mono text-neutral-400 bg-neutral-950/70 border border-neutral-800 px-3.5 py-1.5 rounded-xl backdrop-blur-sm">
        <span>WASD: Move</span>
        <span aria-hidden="true">·</span>
        <span>Shift: Shadow Dodge</span>
        <span aria-hidden="true">·</span>
        <span>Drag: Orbit Camera</span>
        <span aria-hidden="true">·</span>
        <span>E: Inspect / Enter</span>
      </div>
    </div>
  );
};
