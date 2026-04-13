import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayerStore } from '../store/usePlayerStore';

export const BackgroundSlideshow: React.FC = () => {
  const { isPlaying, customBackgrounds } = usePlayerStore();
  const [index, setIndex] = useState(0);

  const allStars = customBackgrounds;

  useEffect(() => {
    if (allStars.length === 0) return;
    
    // Reset index if it becomes out of bounds (e.g. after deletion)
    if (index >= allStars.length) {
      setIndex(0);
    }

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % allStars.length);
    }, isPlaying ? 10000 : 20000);

    return () => clearInterval(interval);
  }, [isPlaying, allStars.length, index]);

  if (allStars.length === 0) return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.5, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={allStars[index].url}
            alt={allStars[index].name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => console.error('Background image failed to load:', allStars[index].url)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
          
          {/* Star Name Label */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-32 left-8 md:bottom-40 md:left-12 z-10"
          >
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mb-1 block">Cinematic Theme</span>
            <h3 className="text-2xl md:text-4xl font-bold text-white/40 tracking-tight">{allStars[index].name}</h3>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      
      {/* Overlay to ensure readability */}
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
    </div>
  );
};
