import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  color?: 'light' | 'dark' | 'white';
}

export default function Card({ children, className = '', color = 'white' }: CardProps) {
  const colorClasses = {
    light: 'bg-gray-100',
    dark: 'bg-gray-800 text-white',
    white: 'bg-white'
  };

  return (
    <div className={`relative flex flex-col min-w-0 break-words ${colorClasses[color]} w-full mb-6 shadow-lg rounded overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  color?: 'red' | 'orange' | 'amber' | 'emerald' | 'teal' | 'lightBlue' | 'indigo' | 'purple' | 'pink';
}

export function CardHeader({ children, className = '', color = 'lightBlue' }: CardHeaderProps) {
  const colorClasses = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500',
    teal: 'bg-teal-500',
    lightBlue: 'bg-blue-500',
    indigo: 'bg-indigo-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500'
  };

  return (
    <div className={`rounded-t mb-0 px-4 py-3 border-0 ${colorClasses[color]} ${className}`}>
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return (
    <div className={`flex-auto px-4 lg:px-6 py-10 pt-6 ${className}`}>
      {children}
    </div>
  );
}
