import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, hover = true }) => {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.08)' } : {}}
      className={cn(
        "glass rounded-2xl p-4 transition-all duration-300",
        className
      )}
    >
      {children}
    </motion.div>
  );
};
