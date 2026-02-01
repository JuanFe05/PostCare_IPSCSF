import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  color?: 'red' | 'orange' | 'amber' | 'emerald' | 'teal' | 'lightBlue' | 'indigo' | 'purple' | 'pink' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
}

export default function Badge({
  children,
  color = 'lightBlue',
  size = 'sm',
  rounded = false,
  className = ''
}: BadgeProps) {
  const colorClasses = {
    red: 'bg-red-500 text-white',
    orange: 'bg-orange-500 text-white',
    amber: 'bg-amber-500 text-white',
    emerald: 'bg-emerald-500 text-white',
    teal: 'bg-teal-500 text-white',
    lightBlue: 'bg-blue-500 text-white',
    indigo: 'bg-indigo-500 text-white',
    purple: 'bg-purple-500 text-white',
    pink: 'bg-pink-500 text-white',
    gray: 'bg-gray-500 text-white'
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const roundedClass = rounded ? 'rounded-full' : 'rounded';

  return (
    <span className={`inline-block font-semibold uppercase ${colorClasses[color]} ${sizeClasses[size]} ${roundedClass} ${className}`}>
      {children}
    </span>
  );
}
