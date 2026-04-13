import React, { useEffect, useRef } from 'react';
import { audioController } from '../lib/audioController';
import { usePlayerStore } from '../store/usePlayerStore';

interface VisualizerProps {
  className?: string;
  color?: string;
}

export const Visualizer: React.FC<VisualizerProps> = ({ 
  className = "", 
  color = "#00ffff" 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const { visualizerMode } = usePlayerStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: { x: number; y: number; size: number; speedX: number; speedY: number }[] = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 2 - 1,
        speedY: Math.random() * 2 - 1,
      });
    }

    const render = () => {
      const analyser = audioController.analyser;
      if (!analyser) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (visualizerMode === 'bars') {
        const barWidth = (width / bufferLength) * 2.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height;
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, `${color}33`);
          gradient.addColorStop(1, color);
          ctx.fillStyle = gradient;
          const radius = barWidth / 2;
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight, barWidth - 2, barHeight, [radius, radius, 0, 0]);
          ctx.fill();
          x += barWidth + 1;
        }
      } else if (visualizerMode === 'waves') {
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = color;
        const sliceWidth = width / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      } else if (visualizerMode === 'particles') {
        const avgFrequency = dataArray.reduce((a, b) => a + b, 0) / bufferLength;
        const scale = 1 + (avgFrequency / 255) * 2;

        particles.forEach((p) => {
          p.x += p.speedX * scale;
          p.y += p.speedY * scale;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * scale, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        });
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [color, visualizerMode]);

  return (
    <canvas 
      ref={canvasRef} 
      className={className}
      width={800}
      height={200}
    />
  );
};
