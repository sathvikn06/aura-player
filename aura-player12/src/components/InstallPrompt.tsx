import React from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePWA } from '../hooks/usePWA';

export const InstallPrompt: React.FC = () => {
  const { isInstallable, showInstallPrompt } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="fixed bottom-28 left-6 right-6 md:left-auto md:right-6 md:w-96 glass p-4 rounded-2xl z-50 flex items-center justify-between shadow-2xl border-neon-cyan/20"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
            <Download className="text-neon-cyan" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-sm">Install Aura Player</h4>
            <p className="text-xs text-gray-400">Add to home screen for offline use</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={showInstallPrompt}
            className="px-4 py-2 bg-neon-cyan text-black text-xs font-bold rounded-lg hover:scale-105 transition-transform"
          >
            Install
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
