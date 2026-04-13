import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sliders, RotateCcw } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';
import { audioController } from '../lib/audioController';

interface EqualizerProps {
  isOpen: boolean;
  onClose: () => void;
}

const BANDS = [
  { label: '32', freq: '32Hz' },
  { label: '64', freq: '64Hz' },
  { label: '125', freq: '125Hz' },
  { label: '250', freq: '250Hz' },
  { label: '500', freq: '500Hz' },
  { label: '1K', freq: '1kHz' },
  { label: '2K', freq: '2kHz' },
  { label: '4K', freq: '4kHz' },
  { label: '8K', freq: '8kHz' },
  { label: '16K', freq: '16kHz' },
];

const PRESETS = [
  { name: 'Flat', values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'Bass Boost', values: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0] },
  { name: 'Electronic', values: [4, 3, 1, 0, 2, 4, 3, 1, 4, 5] },
  { name: 'Rock', values: [3, 2, 1, 0, -1, -1, 0, 1, 2, 3] },
  { name: 'Pop', values: [-1, 0, 2, 3, 2, 0, -1, -1, -1, -1] },
  { name: 'Vocal', values: [-2, -2, -1, 1, 3, 3, 2, 1, 0, 0] },
];

export const Equalizer: React.FC<EqualizerProps> = ({ isOpen, onClose }) => {
  const { equalizer, setEqualizer } = usePlayerStore();

  const handleGainChange = (index: number, value: number) => {
    const newEqualizer = [...equalizer];
    newEqualizer[index] = value;
    setEqualizer(newEqualizer);
    
    // Ensure AudioContext is initialized
    if (!audioController.audioContext) {
      audioController.initVisualizer();
    }
  };

  const resetEqualizer = () => {
    setEqualizer([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  };

  const applyPreset = (values: number[]) => {
    setEqualizer(values);
    if (!audioController.audioContext) {
      audioController.initVisualizer();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-surface border border-glass-border rounded-3xl p-6 md:p-8 z-[70] shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Sliders size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-text-primary">Audio Equalizer</h2>
                  <p className="text-xs text-text-secondary/40 font-medium uppercase tracking-widest">10-Band Premium Processor</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={resetEqualizer}
                  className="p-2 text-text-secondary/40 hover:text-text-primary transition-colors"
                  title="Reset to Flat"
                >
                  <RotateCcw size={18} />
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 text-text-secondary/40 hover:text-text-primary transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-10 gap-2 md:gap-4 h-64 mb-8">
              {BANDS.map((band, i) => (
                <div key={band.label} className="flex flex-col items-center gap-3 h-full">
                  <div className="flex-1 w-1.5 md:w-2 bg-glass border border-glass-border rounded-full relative group">
                    <div 
                      className="absolute bottom-0 left-0 w-full bg-accent rounded-full transition-all duration-75"
                      style={{ height: `${((equalizer[i] + 12) / 24) * 100}%` }}
                    />
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="0.5"
                      value={equalizer[i]}
                      onChange={(e) => handleGainChange(i, parseFloat(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer [writing-mode:bt-lr] appearance-slider-vertical"
                      style={{ WebkitAppearance: 'slider-vertical' } as any}
                    />
                    <div 
                      className="absolute left-1/2 -translate-x-1/2 w-3 h-3 md:w-4 md:h-4 bg-text-primary rounded-full shadow-lg border-2 border-accent pointer-events-none transition-all"
                      style={{ bottom: `calc(${((equalizer[i] + 12) / 24) * 100}% - 8px)` }}
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-text-secondary/60 mb-1">{equalizer[i] > 0 ? `+${equalizer[i]}` : equalizer[i]}</span>
                    <span className="text-[9px] font-bold text-text-secondary/20 uppercase tracking-tighter">{band.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold text-text-secondary/20 uppercase tracking-widest">Presets</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset.values)}
                    className="px-4 py-1.5 rounded-full bg-glass border border-glass-border text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-accent/10 hover:border-accent/20 transition-all"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
