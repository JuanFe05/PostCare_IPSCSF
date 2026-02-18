import { useState } from 'react';
import type { ReactNode } from 'react';

interface AlertProps {
  children: ReactNode;
  type?: 'success' | 'danger' | 'warning' | 'info';
  dismissible?: boolean;
  className?: string;
}

export default function Alert({
  children,
  type = 'info',
  dismissible = false,
  className = ''
}: AlertProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-500',
      icon: 'fa-check-circle',
      text: 'text-white'
    },
    danger: {
      bg: 'bg-red-500',
      icon: 'fa-times-circle',
      text: 'text-white'
    },
    warning: {
      bg: 'bg-orange-500',
      icon: 'fa-exclamation-triangle',
      text: 'text-white'
    },
    info: {
      bg: 'bg-blue-500',
      icon: 'fa-info-circle',
      text: 'text-white'
    }
  };

  const config = typeConfig[type];

  return (
    <div className={`${config.bg} ${config.text} px-6 py-4 border-0 rounded relative mb-4 ${className}`}>
      <span className="inline-block align-middle mr-8">
        <i className={`fas ${config.icon} text-xl mr-2`} />
        {children}
      </span>
      {dismissible && (
        <button
          className="absolute bg-transparent text-2xl font-semibold leading-none right-0 top-0 mt-4 mr-6 outline-none focus:outline-none"
          onClick={() => setVisible(false)}
        >
          <span>×</span>
        </button>
      )}
    </div>
  );
}
