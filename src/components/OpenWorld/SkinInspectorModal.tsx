import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { X, Check, Lock, Sparkles, RotateCw } from 'lucide-react';
import { CustomSkin, SkinId } from '../../types/game';
import { AnimeCharacter } from './CharacterModel';

interface SkinInspectorModalProps {
  skin: CustomSkin | null;
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  isEquipped: boolean;
  onEquipSkin: (skinId: SkinId) => void;
}

export const SkinInspectorModal: React.FC<SkinInspectorModalProps> = ({
  skin,
  isOpen,
  onClose,
  isUnlocked,
  isEquipped,
  onEquipSkin,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen || !skin) return;
    const container = mountRef.current;
    if (!container) return;

    // Three.js 360 viewer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#080D18');

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(0, 1.4, 3.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    container.appendChild(renderer.domElement);

    // Studio Lighting
    const keyLight = new THREE.DirectionalLight('#FFFFFF', 2.2);
    keyLight.position.set(5, 10, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(skin.primaryColor, 1.4);
    fillLight.position.set(-5, 4, -3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(skin.secondaryColor, 2.5, 15);
    rimLight.position.set(0, 2.5, -3);
    scene.add(rimLight);

    const ambientLight = new THREE.AmbientLight('#1E293B', 1.5);
    scene.add(ambientLight);

    // Rotating Pedestal Base
    const baseGeo = new THREE.CylinderGeometry(1.2, 1.3, 0.2, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: '#0F172A',
      roughness: 0.2,
      metalness: 0.9,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = -0.1;
    scene.add(base);

    const rimGeo = new THREE.TorusGeometry(1.22, 0.04, 8, 32);
    const rimMat = new THREE.MeshBasicMaterial({ color: skin.primaryColor });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = -Math.PI / 2;
    rim.position.y = 0.01;
    scene.add(rim);

    // 3D Model
    const charModel = new AnimeCharacter(skin, true);
    scene.add(charModel.group);

    // Drag Orbit interaction
    let isDragging = false;
    let prevX = 0;
    let rotationY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      prevX = e.clientX;
      rotationY += dx * 0.01;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Touch support for 360 orbit
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isDragging = true;
        prevX = e.touches[0].clientX;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const dx = e.touches[0].clientX - prevX;
      prevX = e.touches[0].clientX;
      rotationY += dx * 0.015;
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('touchstart', onTouchStart);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    // Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      const delta = clock.getDelta();
      // Auto rotate gently if not dragging
      if (!isDragging) {
        rotationY += delta * 0.45;
      }

      charModel.group.rotation.y = rotationY;
      charModel.update(delta, false, false);

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isOpen, skin]);

  if (!isOpen || !skin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-neutral-400 hover:text-white bg-neutral-950/80 rounded-xl transition-colors cursor-pointer"
          aria-label="Close inspection"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 3D Viewport Column */}
        <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto min-h-[300px] bg-gradient-to-b from-neutral-950 to-neutral-900 flex items-center justify-center">
          <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-mono text-neutral-400 bg-neutral-950/70 px-2.5 py-1 rounded-full flex items-center gap-1.5 pointer-events-none">
            <RotateCw className="w-3 h-3 text-cyan-400 animate-spin" />
            <span>Drag to rotate in 360°</span>
          </div>
        </div>

        {/* Lore & Details Column */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: skin.primaryColor }}
              />
              <span className="text-xs font-mono tracking-widest text-neutral-400 uppercase">
                Blade Model Inspection
              </span>
            </div>

            <h3 className="text-2xl font-black font-display text-white mb-2">
              {skin.name}
            </h3>

            <p className="text-xs text-neutral-300 mb-4 leading-relaxed">
              {skin.tagline}
            </p>

            <div className="p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-2xl mb-4">
              <div className="text-[11px] font-mono uppercase text-neutral-400 mb-1">
                Unlock Requirement
              </div>
              <div className="text-xs text-neutral-200 font-medium">
                {skin.unlockRequirement}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: skin.primaryColor }} />
              <span className="text-neutral-400 font-mono">Primary Neon</span>
              <div className="w-4 h-4 rounded-full border ml-3" style={{ backgroundColor: skin.secondaryColor }} />
              <span className="text-neutral-400 font-mono">Edge Glow</span>
            </div>
          </div>

          {/* Action button */}
          <div className="mt-6 pt-4 border-t border-neutral-800">
            {isEquipped ? (
              <div
                className="w-full py-3 rounded-xl text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 border"
                style={{
                  color: skin.primaryColor,
                  borderColor: `${skin.primaryColor}60`,
                  backgroundColor: `${skin.primaryColor}15`,
                }}
              >
                <Check className="w-4 h-4" />
                <span>CURRENTLY EQUIPPED</span>
              </div>
            ) : isUnlocked ? (
              <button
                onClick={() => {
                  onEquipSkin(skin.id);
                  onClose();
                }}
                className="w-full py-3 rounded-xl text-xs font-bold font-display tracking-wider bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>EQUIP THIS BLADE SKIN</span>
              </button>
            ) : (
              <div className="w-full py-3 rounded-xl text-xs font-mono text-neutral-500 bg-neutral-950 border border-neutral-800 text-center flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                <span>LOCKED — COMPLETE MILESTONE TO UNLOCK</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
