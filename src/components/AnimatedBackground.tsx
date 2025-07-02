import React, { useEffect, useRef } from 'react';

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    color: string;
  }>>([]);
  const buildingsRef = useRef<Array<{
    x: number;
    width: number;
    height: number;
    windows: Array<{ x: number; y: number; lit: boolean; flickerTimer: number }>;
    color: string;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeScene();
    };

    const initializeScene = () => {
      // Initialize particles
      particlesRef.current = [];
      const colors = ['#00d4ff', '#7c3aed', '#06b6d4', '#a855f7', '#ff4444', '#10b981'];
      for (let i = 0; i < 80; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          size: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.6 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)]
        });
      }

      // Initialize cyberpunk cityscape
      buildingsRef.current = [];
      const buildingColors = ['#1a1a2e', '#16213e', '#0f3460', '#533483'];
      let currentX = 0;
      
      while (currentX < canvas.width + 100) {
        const width = Math.random() * 120 + 60;
        const height = Math.random() * 300 + 150;
        const building = {
          x: currentX,
          width,
          height,
          windows: [] as Array<{ x: number; y: number; lit: boolean; flickerTimer: number }>,
          color: buildingColors[Math.floor(Math.random() * buildingColors.length)]
        };

        // Add windows to building
        const windowRows = Math.floor(height / 25);
        const windowCols = Math.floor(width / 20);
        
        for (let row = 0; row < windowRows; row++) {
          for (let col = 0; col < windowCols; col++) {
            if (Math.random() > 0.3) { // 70% chance of window
              building.windows.push({
                x: col * 20 + 5,
                y: row * 25 + 10,
                lit: Math.random() > 0.4, // 60% chance of being lit
                flickerTimer: Math.random() * 1000
              });
            }
          }
        }

        buildingsRef.current.push(building);
        currentX += width + Math.random() * 20;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let animationId: number;
    let lastTime = 0;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient sky
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#0a0a0a');
      gradient.addColorStop(0.3, '#1a1a2e');
      gradient.addColorStop(0.7, '#16213e');
      gradient.addColorStop(1, '#0f3460');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw cyberpunk grid
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)';
      ctx.lineWidth = 1;
      
      const gridSize = 50;
      const offsetY = (currentTime * 0.02) % gridSize;
      
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = -gridSize; y < canvas.height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y + offsetY);
        ctx.lineTo(canvas.width, y + offsetY);
        ctx.stroke();
      }

      // Draw cityscape buildings
      buildingsRef.current.forEach(building => {
        const buildingY = canvas.height - building.height;
        
        // Building silhouette
        ctx.fillStyle = building.color;
        ctx.fillRect(building.x, buildingY, building.width, building.height);
        
        // Building outline
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(building.x, buildingY, building.width, building.height);
        
        // Windows
        building.windows.forEach(window => {
          window.flickerTimer += deltaTime;
          
          // Random flicker effect
          if (window.flickerTimer > 2000 + Math.random() * 3000) {
            window.lit = !window.lit;
            window.flickerTimer = 0;
          }
          
          if (window.lit) {
            const windowX = building.x + window.x;
            const windowY = buildingY + window.y;
            
            // Window glow
            ctx.fillStyle = Math.random() > 0.95 ? '#ff4444' : '#00d4ff';
            ctx.fillRect(windowX, windowY, 12, 8);
            
            // Window glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = ctx.fillStyle;
            ctx.fillRect(windowX, windowY, 12, 8);
            ctx.shadowBlur = 0;
          }
        });

        // Antenna/details on some buildings
        if (Math.random() > 0.7) {
          ctx.strokeStyle = '#00d4ff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(building.x + building.width / 2, buildingY);
          ctx.lineTo(building.x + building.width / 2, buildingY - 20);
          ctx.stroke();
          
          // Blinking light on antenna
          if (Math.sin(currentTime * 0.01) > 0) {
            ctx.fillStyle = '#ff4444';
            ctx.beginPath();
            ctx.arc(building.x + building.width / 2, buildingY - 20, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Draw flying vehicles/drones
      const droneCount = 3;
      for (let i = 0; i < droneCount; i++) {
        const droneX = (currentTime * 0.05 + i * 200) % (canvas.width + 100);
        const droneY = 100 + Math.sin(currentTime * 0.003 + i) * 30;
        
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(droneX, droneY, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Drone trail
        ctx.strokeStyle = 'rgba(255, 68, 68, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(droneX - 10, droneY);
        ctx.lineTo(droneX - 20, droneY);
        ctx.stroke();
      }

      // Draw and update particles
      particlesRef.current.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw scanning lines
      const scanLineY = (currentTime * 0.1) % canvas.height;
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, scanLineY);
      ctx.lineTo(canvas.width, scanLineY);
      ctx.stroke();

      // Draw holographic elements
      ctx.strokeStyle = 'rgba(124, 58, 237, 0.4)';
      ctx.lineWidth = 1;
      const holoSize = 100;
      const holoX = canvas.width - 150;
      const holoY = 100;
      
      ctx.beginPath();
      ctx.rect(holoX, holoY, holoSize, holoSize);
      ctx.stroke();
      
      // Holographic grid inside
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(holoX + i * 20, holoY);
        ctx.lineTo(holoX + i * 20, holoY + holoSize);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(holoX, holoY + i * 20);
        ctx.lineTo(holoX + holoSize, holoY + i * 20);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0a 100%)' }}
    />
  );
};

export default AnimatedBackground;