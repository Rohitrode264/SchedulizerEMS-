import React from 'react';
import { cn } from '../utils/cn'; 
import { theme } from '../Theme/theme';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
};

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  className = '',
}: ButtonProps) {
  const baseStyles =
    'flex items-center justify-center px-5 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer';

  const variants: Record<string, string> = {
    primary:
      `${theme.secondary.main} text-white hover:${theme.secondary.hover} disabled:${theme.secondary.light}`,
    secondary:
      `${theme.surface.secondary} ${theme.secondary.text} hover:${theme.surface.tertiary} disabled:opacity-60`,
    outline:
      `border ${theme.secondary.border} ${theme.secondary.text} ${theme.surface.main} hover:${theme.secondary.light} disabled:opacity-60`,
    ghost:
      `bg-transparent ${theme.secondary.text} hover:${theme.surface.secondary} disabled:opacity-60`,
    danger:
      `${theme.text.tertiary} text-white hover:${theme.text.secondary} disabled:${theme.text.tertiary}`,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(baseStyles, variants[variant], className)}
    >
      {loading ? (
        <span className="animate-pulse">Loading...</span>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
