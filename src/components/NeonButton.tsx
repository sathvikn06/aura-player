import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'cyan' | 'pink';
  size?: 'sm' | 'md' | 'lg';
}

export const NeonButton: React.FC<NeonButtonProps> = ({ 
  children, 
  variant = 'cyan', 
  size = 'md',
  className,
  ...props 
}) => {
  const variants = {
    cyan: 'border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 neon-shadow-cyan',
    pink: 'border-neon-pink text-neon-pink hover:bg-neon-pink/10 neon-shadow-pink',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "border rounded-full font-medium transition-all duration-300",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};
