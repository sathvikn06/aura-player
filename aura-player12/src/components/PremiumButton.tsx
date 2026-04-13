import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className,
  ...props 
}) => {
  const variants = {
    primary: 'bg-accent text-white hover:opacity-90',
    secondary: 'bg-surface text-text-primary border-glass-border hover:bg-glass',
    outline: 'border-glass-border text-text-primary hover:bg-glass',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "rounded-full font-bold transition-all duration-200 border border-transparent",
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
