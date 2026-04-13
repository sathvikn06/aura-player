import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Moon, Clock, RotateCcw } from 'lucide-react';
import { usePlayerStore } from '../store/usePlayerStore';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OPTIONS = [
  { label: 'Off', value: null },
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hour', value: 60 },
];

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({ isOpen, onClose }) => {
  const { sleepTimer, setSleepTimer } = usePlayerStore();

  const handleSelect = (value: number | null) => {
    setSleepTimer(value);
    onClose();
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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-surface border border-glass-border rounded-3xl p-6 md:p-8 z-[70] shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Moon size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-text-primary">Sleep Timer</h2>
                  <p className="text-xs text-text-secondary/40 font-medium uppercase tracking-widest">Auto-stop playback</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-text-secondary/40 hover:text-text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-2">
              {OPTIONS.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    sleepTimer === option.value 
                      ? 'bg-accent text-white font-bold' 
                      : 'bg-glass text-text-secondary hover:bg-accent/10 hover:text-text-primary'
                  }`}
                >
                  <span className="text-sm">{option.label}</span>
                  {sleepTimer === option.value && <Clock size={16} />}
                </button>
              ))}
            </div>

            {sleepTimer !== null && (
              <div className="mt-6 p-4 bg-accent/10 rounded-2xl border border-accent/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock size={16} className="text-accent" />
                  <span className="text-xs font-bold text-accent uppercase tracking-widest">
                    {sleepTimer} min remaining
                  </span>
                </div>
                <button 
                  onClick={() => setSleepTimer(null)}
                  className="text-[10px] font-bold text-text-secondary/40 hover:text-text-primary uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
