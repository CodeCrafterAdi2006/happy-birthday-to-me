import React, { useEffect, useRef, useState } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
  twinkleSpeed: number;
  phase: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface CosmicBackgroundProps {
  currentStep: number;
  isConstellationAssembled: boolean;
  constellationPoints: { x: number; y: number; color: string }[];
}

export const CosmicBackground: React.FC<CosmicBackgroundProps> = ({
  currentStep,
  isConstellationAssembled,
  constellationPoints,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Handle Resize using ResizeObserver as suggested in the instructions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Initialize background stars once
  useEffect(() => {
    const starCount = 120;
    const items: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      items.push({
        x: Math.random(),
        y: Math.random(),
        size: 0.6 + Math.random() * 1.8,
        alpha: 0.1 + Math.random() * 0.9,
        twinkleSpeed: 0.01 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = items;
  }, []);

  // Trigger firework bursts for the final assembly stage
  useEffect(() => {
    if (isConstellationAssembled) {
      // Create multiple bursts in sequence
      const triggerBurst = () => {
        const cx = dimensions.width * (0.2 + Math.random() * 0.6);
        const cy = dimensions.height * (0.2 + Math.random() * 0.5);
        const hue = Math.random() * 360;
        const color = `hsla(${hue}, 95%, 65%, 1)`;
        
        for (let i = 0; i < 40; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.5 + Math.random() * 4.5;
          particlesRef.current.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.5, // slight upward float
            size: 1.5 + Math.random() * 2.5,
            color,
            alpha: 1,
            life: 0,
            maxLife: 60 + Math.random() * 50,
          });
        }
      };

      // Trigger immediately and then on interval
      triggerBurst();
      triggerBurst();
      const interval = setInterval(() => {
        triggerBurst();
      }, 900);

      return () => clearInterval(interval);
    }
  }, [isConstellationAssembled, dimensions]);

  // Trigger subtle spark particles when steps change
  useEffect(() => {
    if (currentStep > 0) {
      // Trigger a small burst of magical stars near centre or random spot
      const cx = dimensions.width / 2;
      const cy = dimensions.height * 0.45;
      
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.8 + Math.random() * 2.5;
        particlesRef.current.push({
          x: cx + (Math.random() - 0.5) * 100,
          y: cy + (Math.random() - 0.5) * 100,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 1.2 + Math.random() * 1.8,
          color: 'rgba(251, 191, 36, 0.95)', // Golden sparks
          alpha: 1,
          life: 0,
          maxLife: 40 + Math.random() * 20,
        });
      }
    }
  }, [currentStep, dimensions]);

  // Animation Loop - Target 60fps
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // Deep elegant dark canvas clear
      ctx.fillStyle = '#02040a';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Render cosmic background nebula gradient glow
      const grad1 = ctx.createRadialGradient(
        dimensions.width * 0.3,
        dimensions.height * 0.3,
        50,
        dimensions.width * 0.3,
        dimensions.height * 0.3,
        dimensions.width * 0.6
      );
      grad1.addColorStop(0, 'rgba(49, 46, 129, 0.22)'); // Deep indigo
      grad1.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      const grad2 = ctx.createRadialGradient(
        dimensions.width * 0.7,
        dimensions.height * 0.6,
        100,
        dimensions.width * 0.7,
        dimensions.height * 0.6,
        dimensions.width * 0.7
      );
      grad2.addColorStop(0, 'rgba(88, 28, 135, 0.24)'); // Editorial purple
      grad2.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Draw standard space stars
      starsRef.current.forEach((star) => {
        star.phase += star.twinkleSpeed;
        const alpha = Math.max(0.1, Math.min(1.0, star.alpha + Math.sin(star.phase) * 0.3));
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(star.x * dimensions.width, star.y * dimensions.height, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render constellation connect lines in final layout or when multiple dots appear
      if (constellationPoints.length > 1) {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < constellationPoints.length; i++) {
          const pt1 = constellationPoints[i];
          const px1 = (pt1.x / 100) * (dimensions.width * 0.8) + dimensions.width / 2;
          const py1 = (pt1.y / 100) * (dimensions.height * 0.6) + dimensions.height * 0.45;

          // Connect each point to its nearest 2 or 3 neighbors to build an elegant astronomical lattice
          for (let j = i + 1; j < constellationPoints.length; j++) {
            const pt2 = constellationPoints[j];
            const px2 = (pt2.x / 100) * (dimensions.width * 0.8) + dimensions.width / 2;
            const py2 = (pt2.y / 100) * (dimensions.height * 0.6) + dimensions.height * 0.45;
            
            // Calculate distance
            const dx = px1 - px2;
            const dy = py1 - py2;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 220) {
              ctx.moveTo(px1, py1);
              ctx.lineTo(px2, py2);
            }
          }
        }
        ctx.stroke();
      }

      // Update and draw active explosion/spark particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.015; // light gravity pull
        p.life += 1;
        p.alpha = 1 - p.life / p.maxLife;

        if (p.alpha <= 0) return false;

        ctx.fillStyle = p.color.replace('1)', `${p.alpha})`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.alpha, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [dimensions, constellationPoints]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full -z-10 bg-[#02040a] overflow-hidden">
      {/* Cinematic Background Blur Elements from Editorial Style */}
      <div className="absolute inset-0 opacity-[0.45] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/40 blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-amber-900/20 blur-[100px]" />
      </div>

      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="block w-full h-full pointer-events-none"
        id="bg-starfield-canvas"
      />
      {/* Background Soft Golden Nebula Radial Glow */}
      <div className="absolute inset-x-0 bottom-0 top-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,53,4,0.07)_0%,rgba(0,0,0,0)_60%)] pointer-events-none" />

      {/* Elegant Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#02040a]/90 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] opacity-90" />
    </div>
  );
};
