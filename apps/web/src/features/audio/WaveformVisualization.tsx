import React, { useEffect, useRef, useState } from 'react';
import { useAudioPlayer } from '../../hooks/useAudio';

interface WaveformVisualizationProps {
  className?: string;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export function WaveformVisualization({ 
  className = '',
  height = 60,
  color = '#FF6B35',
  backgroundColor = 'rgba(255, 255, 255, 0.1)'
}: WaveformVisualizationProps) {
  const { currentTime, duration, isPlaying } = useAudioPlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Generate mock waveform data
  useEffect(() => {
    const bars = 100;
    const data: number[] = [];
    
    for (let i = 0; i < bars; i++) {
      const baseHeight = Math.random() * 0.3 + 0.1;
      const variation = Math.sin(i * 0.1) * 0.2;
      const noise = Math.random() * 0.1;
      data.push(Math.max(0.05, Math.min(1, baseHeight + variation + noise)));
    }
    
    setWaveformData(data);
  }, []);

  // Draw waveform on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    if (waveformData.length === 0) return;

    const barWidth = width / waveformData.length;
    const progress = duration > 0 ? currentTime / duration : 0;
    const currentBarIndex = Math.floor(progress * waveformData.length);

    // Draw waveform bars
    waveformData.forEach((value, index) => {
      const barHeight = value * height * 0.8;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;

      // Determine color based on playback position
      if (index < currentBarIndex) {
        ctx.fillStyle = color;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      }

      // Draw bar with rounded top
      const barRadius = barWidth / 4;
      ctx.beginPath();
      ctx.moveTo(x + barRadius, y + barHeight);
      ctx.lineTo(x + barWidth - barRadius, y + barHeight);
      ctx.quadraticCurveTo(x + barWidth, y + barHeight, x + barWidth, y + barHeight - barRadius);
      ctx.lineTo(x + barWidth, y + barRadius);
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth - barRadius, y);
      ctx.lineTo(x + barRadius, y);
      ctx.quadraticCurveTo(x, y, x, y + barRadius);
      ctx.closePath();
      ctx.fill();
    });

    // Draw progress line
    if (isPlaying && currentBarIndex > 0) {
      const progressX = currentBarIndex * barWidth;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(progressX, 0);
      ctx.lineTo(progressX, height);
      ctx.stroke();
    }
  }, [waveformData, currentTime, duration, isPlaying, color, backgroundColor]);

  // Handle canvas click for seeking
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !duration) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickPercent = x / rect.width;
    const newTime = clickPercent * duration;

    // This would need to be connected to the audio player
    console.log('Seek to:', newTime);
  };

  return (
    <div className={`relative cursor-pointer ${className}`}>
      <canvas
        ref={canvasRef}
        width={300}
        height={height}
        onClick={handleCanvasClick}
        className="w-full h-full"
        style={{ imageRendering: 'crisp-edges' }}
      />
      
      {/* Overlay for loading state */}
      {duration === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-sm">Chargement...</div>
        </div>
      )}
    </div>
  );
}

// Compact version for mini player
export function CompactWaveform({ 
  className = '',
  height = 40 
}: WaveformVisualizationProps) {
  const { currentTime, duration, isPlaying } = useAudioPlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Generate simplified waveform
  useEffect(() => {
    const bars = 50;
    const data: number[] = [];
    
    for (let i = 0; i < bars; i++) {
      const value = Math.random() * 0.4 + 0.1;
      data.push(value);
    }
    
    setWaveformData(data);
  }, []);

  // Draw compact waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, width, height);

    if (waveformData.length === 0) return;

    const barWidth = width / waveformData.length;
    const progress = duration > 0 ? currentTime / duration : 0;

    // Draw simplified waveform
    waveformData.forEach((value, index) => {
      const barHeight = value * height * 0.6;
      const x = index * barWidth;
      const y = (height - barHeight) / 2;

      // Simple color based on progress
      ctx.fillStyle = index / waveformData.length < progress ? '#FF6B35' : 'rgba(255, 255, 255, 0.2)';
      
      // Draw simple rectangle
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    });
  }, [waveformData, currentTime, duration]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={200}
        height={height}
        className="w-full h-full"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  );
}
