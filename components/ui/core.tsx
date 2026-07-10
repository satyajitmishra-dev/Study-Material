'use client';

import React from 'react';
import { motion } from 'framer-motion';

// --- PREMIUM BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', children, className = '', ...props }, ref) => {
    const baseStyle = "relative px-4 py-2 text-[13px] font-medium tracking-wide rounded-lg flex items-center justify-center gap-2 transition-all duration-150 outline-none select-none active:scale-[0.98]";
    
    const variants = {
      primary: "bg-warm-white text-onyx hover:bg-mist border border-warm-white shadow-sm",
      secondary: "bg-charcoal/40 text-stone border border-white/5 hover:bg-charcoal/80 hover:text-warm-white hover:border-white/10",
      ghost: "bg-transparent text-stone hover:text-warm-white hover:bg-white/5 border border-transparent",
      accent: "bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20 hover:bg-accent-cyan/20"
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={`${baseStyle} ${variants[variant]} ${className}`}
        suppressHydrationWarning
        {...(props as any)}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';

// --- GLOWING INPUT ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-[11px] font-semibold text-stone uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative group">
          <input
            ref={ref}
            className={`w-full px-3 py-2 text-[13px] bg-charcoal/20 border border-white/5 rounded-lg text-warm-white outline-none transition-all duration-200 
              focus:border-white/20 focus:bg-charcoal/40 focus:ring-1 focus:ring-white/10
              placeholder:text-stone/60 ${className}`}
            suppressHydrationWarning
            {...props}
          />
          <div className="absolute inset-0 -z-10 rounded-lg bg-white/5 opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-200" />
        </div>
      </div>
    );
  }
);
Input.displayName = 'Input';

// --- PREMIUM ELEVATED CARD ---
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: 'default' | 'cyan' | 'violet';
}

export function Card({ children, glowColor = 'default', className = '', ...props }: CardProps) {
  const glowStyles = {
    default: 'shadow-premium hover:shadow-glow',
    cyan: 'shadow-premium shadow-glow-cyan/5 hover:border-accent-cyan/30',
    violet: 'shadow-premium shadow-glow-violet/5 hover:border-accent-violet/30'
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`bg-charcoal/35 border border-white/5 rounded-xl p-5 backdrop-blur-sm transition-all duration-200 hover:border-white/12 ${glowStyles[glowColor]} ${className}`}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
}

// --- MOTION TABS ---
interface TabOption {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
}

interface TabsProps {
  options: TabOption[];
  activeId: string;
  onChange: (id: string) => void;
  layoutId?: string;
  className?: string;
}

export function Tabs({ options, activeId, onChange, layoutId = 'active-tab-pill', className = '' }: TabsProps) {
  return (
    <div className={`flex items-center gap-1.5 p-1 rounded-xl bg-charcoal/30 border border-white/5 w-fit ${className}`}>
      {options.map((option) => {
        const isActive = option.id === activeId;
        const Icon = option.icon;

        return (
          <button
            key={option.id}
            onClick={() => onChange(option.id)}
            className={`relative px-3.5 py-1.5 rounded-lg text-[12px] font-medium tracking-wide flex items-center gap-2 transition-colors duration-150 select-none cursor-pointer
              ${isActive ? 'text-onyx' : 'text-stone hover:text-warm-white'}
            `}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                transition={{ type: 'spring', damping: 25, stiffness: 260 }}
                className="absolute inset-0 bg-warm-white rounded-lg -z-10"
              />
            )}
            {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
