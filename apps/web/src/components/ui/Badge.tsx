import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  className, 
  variant = 'primary',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors';
  
  const variantClasses = {
    primary: 'bg-orange-600 text-white',
    secondary: 'bg-gray-700 text-gray-200',
    outline: 'border border-gray-600 text-gray-300 bg-transparent',
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};
