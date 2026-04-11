import React, { useEffect, useRef } from 'react';
import { audioController } from '../lib/audioController';

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

      const barWidth = (width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height;

        // Create gradient for bars
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, `${color}33`); // Transparent
        gradient.addColorStop(1, color); // Solid

        ctx.fillStyle = gradient;
        
        // Draw rounded bars
        const radius = barWidth / 2;
        const y = height - barHeight;
        
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth - 2, barHeight, [radius, radius, 0, 0]);
        ctx.fill();

        x += barWidth + 1;
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [color]);

  return (
    <canvas 
      ref={canvasRef} 
      className={className}
      width={800}
      height={200}
    />
  );
};
