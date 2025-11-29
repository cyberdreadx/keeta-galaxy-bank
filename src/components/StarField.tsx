import { useEffect, useRef } from 'react';

export const StarField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    interface Star {
      x: number;
      y: number;
      size: number;
      baseOpacity: number;
      twinkleSpeed: number;
      twinkleOffset: number;
      twinkleIntensity: number;
      color: { r: number; g: number; b: number };
    }

    const stars: Star[] = [];
    const numStars = 350;

    // Star colors - mostly white/blue with occasional warm tones
    const starColors = [
      { r: 200, g: 220, b: 255 }, // Blue-white
      { r: 255, g: 255, b: 255 }, // Pure white
      { r: 180, g: 200, b: 255 }, // Light blue
      { r: 255, g: 240, b: 200 }, // Warm white
      { r: 150, g: 180, b: 255 }, // Blue
    ];

    for (let i = 0; i < numStars; i++) {
      const isBrightStar = Math.random() < 0.15; // 15% chance of being a bright twinkling star
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: isBrightStar ? Math.random() * 2 + 1 : Math.random() * 1.2 + 0.3,
        baseOpacity: isBrightStar ? Math.random() * 0.3 + 0.7 : Math.random() * 0.4 + 0.3,
        twinkleSpeed: isBrightStar ? Math.random() * 3 + 2 : Math.random() * 1.5 + 0.5,
        twinkleOffset: Math.random() * Math.PI * 2,
        twinkleIntensity: isBrightStar ? Math.random() * 0.7 + 0.3 : Math.random() * 0.4 + 0.1,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    let animationId: number;
    let time = 0;

    const animate = () => {
      ctx.fillStyle = 'rgb(5, 8, 15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time += 0.016;

      stars.forEach((star) => {
        // Multi-frequency twinkling for more natural effect
        const twinkle1 = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
        const twinkle2 = Math.sin(time * star.twinkleSpeed * 2.3 + star.twinkleOffset * 1.5) * 0.5;
        const combinedTwinkle = (twinkle1 + twinkle2) / 1.5;
        
        const twinkleFactor = 1 - star.twinkleIntensity + (combinedTwinkle * 0.5 + 0.5) * star.twinkleIntensity;
        const finalOpacity = star.baseOpacity * twinkleFactor;
        const finalSize = star.size * (0.9 + twinkleFactor * 0.2);

        const { r, g, b } = star.color;

        // Draw star core
        ctx.beginPath();
        ctx.arc(star.x, star.y, finalSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity})`;
        ctx.fill();

        // Add glow to brighter stars
        if (star.size > 1 && finalOpacity > 0.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, finalSize * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r * 0.6}, ${g * 0.7}, ${b}, ${finalOpacity * 0.15})`;
          ctx.fill();
          
          // Inner glow
          ctx.beginPath();
          ctx.arc(star.x, star.y, finalSize * 1.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity * 0.25})`;
          ctx.fill();
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
};
