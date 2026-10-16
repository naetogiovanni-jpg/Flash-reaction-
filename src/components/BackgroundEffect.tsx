import React, { useEffect, useRef } from 'react';

interface BackgroundEffectProps {
  burstTrigger?: number; // timestamp increment to fire a shockwave
  flashColor?: string;
  reducedMotion?: boolean;
}

export const BackgroundEffect: React.FC<BackgroundEffectProps> = ({
  burstTrigger,
  flashColor,
  reducedMotion = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle system
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      color: string;
      life: number;
      maxLife: number;
    }

    interface Shockwave {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      alpha: number;
      color: string;
    }

    const particles: Particle[] = [];
    const shockwaves: Shockwave[] = [];

    // Ambient floating particles
    const particleColors = ['#06B6D4', '#38BDF8', '#818CF8', '#A855F7'];
    const maxAmbient = reducedMotion ? 12 : 36;

    for (let i = 0; i < maxAmbient; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.2 - Math.random() * 0.5,
        size: 1 + Math.random() * 2,
        alpha: 0.15 + Math.random() * 0.4,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        life: 0,
        maxLife: 300 + Math.random() * 300,
      });
    }

    // Trigger shockwave and bursts
    const addShockwave = (x: number, y: number, color = '#06B6D4') => {
      if (reducedMotion) return;
      shockwaves.push({
        x,
        y,
        radius: 10,
        maxRadius: Math.max(width, height) * 0.6,
        alpha: 0.8,
        color,
      });

      // Burst particles
      for (let i = 0; i < 28; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 7;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 2 + Math.random() * 3,
          alpha: 0.9,
          color,
          life: 0,
          maxLife: 40 + Math.random() * 30,
        });
      }
    };

    // Keep function reference for triggers
    (canvas as unknown as { addBurst: (c?: string) => void }).addBurst = (c) => {
      addShockwave(width / 2, height / 2, c || flashColor || '#06B6D4');
    };

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // Cyber Grid lines (subtle dark floor/ceiling perspective)
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 64;
      const offsetX = (tick * 0.15) % gridSize;
      const offsetY = (tick * 0.25) % gridSize;

      ctx.beginPath();
      for (let x = offsetX; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = offsetY; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += (sw.maxRadius - sw.radius) * 0.12 + 2;
        sw.alpha *= 0.91;

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.alpha;
        ctx.lineWidth = Math.max(1, 4 * (1 - sw.radius / sw.maxRadius));
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.restore();

        if (sw.alpha < 0.02 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
        }
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * (1 - p.life / p.maxLife);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 2;
        ctx.fill();
        ctx.restore();

        // Recycle ambient particles
        if (p.life >= p.maxLife || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          if (particles.length > maxAmbient) {
            particles.splice(i, 1);
          } else {
            p.x = Math.random() * width;
            p.y = height + 10;
            p.vx = (Math.random() - 0.5) * 0.4;
            p.vy = -0.2 - Math.random() * 0.6;
            p.life = 0;
            p.alpha = 0.2 + Math.random() * 0.4;
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [reducedMotion]);

  // Trigger burst when burstTrigger changes
  useEffect(() => {
    if (burstTrigger && canvasRef.current) {
      const helper = canvasRef.current as unknown as { addBurst?: (c?: string) => void };
      if (helper.addBurst) {
        helper.addBurst(flashColor);
      }
    }
  }, [burstTrigger, flashColor]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* Anime vignette & radial glow backdrop */}
      <div className="absolute inset-0 bg-radial from-cyan-950/20 via-neutral-950/70 to-neutral-950 pointer-events-none" />
      {/* Scanline texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.4) 3px, transparent 4px)',
        }}
      />
    </div>
  );
};
