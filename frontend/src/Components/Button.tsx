import React from 'react';
import { cn } from '../utils/cn'; 

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
    'flex items-center justify-center px-5 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer    ';

  const variants: Record<string, string> = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400',
    secondary:
      'bg-gray-100 text-indigo-600 hover:bg-gray-200 disabled:opacity-60',
    outline:
      'border border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-50 disabled:opacity-60',
    ghost:
      'bg-transparent text-indigo-600 hover:bg-indigo-100 disabled:opacity-60',
    danger:
      'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400',
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
