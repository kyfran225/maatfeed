import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const variants = {
  primary: 'bg-amber-500 text-black hover:bg-amber-400 focus:ring-amber-500',
  secondary: 'bg-gray-800 text-white hover:bg-gray-700 focus:ring-gray-500',
  outline: 'border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black focus:ring-amber-500',
  ghost: 'text-gray-400 hover:text-white hover:bg-gray-800 focus:ring-gray-500'
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
};

export function EnhancedButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: EnhancedButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed';
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

  const { onDrag, onDragStart, onDragEnd, ...motionProps } = props as any;
  
  return (
    <motion.button
      className={classes}
      disabled={disabled || loading}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...motionProps}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mr-2"
        >
          <Loader2 className="w-4 h-4" />
        </motion.div>
      )}
      
      {icon && !loading && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="mr-2"
        >
          {icon}
        </motion.span>
      )}
      
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.1 }}
      >
        {children}
      </motion.span>
    </motion.button>
  );
}
