import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  color?: 'lightBlue' | 'red' | 'emerald' | 'gray' | 'white' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  outline?: boolean;
  fullWidth?: boolean;
  icon?: string;
}

export default function Button({
  children,
  color = 'lightBlue',
  size = 'md',
  outline = false,
  fullWidth = false,
  icon,
  className = '',
  disabled = false,
  ...props
}: ButtonProps) {
  const baseClasses = 'font-semibold uppercase transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const sizeClasses = {
    sm: 'text-xs px-4 py-2 rounded-md',
    md: 'text-sm px-6 py-3 rounded-lg',
    lg: 'text-base px-8 py-4 rounded-xl'
  };

  const solidColors = {
    lightBlue: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300 shadow-md hover:shadow-lg',
    red: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-300 shadow-md hover:shadow-lg',
    emerald: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-300 shadow-md hover:shadow-lg',
    gray: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-300 shadow-md hover:shadow-lg',
    white: 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-200 shadow-md hover:shadow-lg border border-gray-200',
    dark: 'bg-gray-900 text-white hover:bg-black focus:ring-gray-700 shadow-md hover:shadow-lg'
  };

  const outlineColors = {
    lightBlue: 'bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-300',
    red: 'bg-transparent border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white focus:ring-red-300',
    emerald: 'bg-transparent border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white focus:ring-emerald-300',
    gray: 'bg-transparent border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white focus:ring-gray-300',
    white: 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-700 focus:ring-gray-200',
    dark: 'bg-transparent border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white focus:ring-gray-700'
  };

  const colorClass = outline ? outlineColors[color] : solidColors[color];
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${colorClass} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <i className={`${icon} mr-2`} />}
      {children}
    </button>
  );
}
