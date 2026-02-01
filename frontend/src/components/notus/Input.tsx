import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, fullWidth = true, className = '', ...props }, ref) => {
    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <div className={`relative ${widthClass} mb-4`}>
        {label && (
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400">
              <i className={icon} />
            </span>
          )}
          <input
            ref={ref}
            className={`
              ${widthClass}
              ${icon ? 'pl-12 pr-4' : 'px-4'}
              py-3
              border-2 border-gray-200
              rounded-lg
              text-gray-700
              placeholder-gray-400
              bg-white
              focus:outline-none
              focus:border-blue-500
              focus:ring-2
              focus:ring-blue-200
              transition-all
              duration-200
              ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-2 flex items-center">
            <i className="fas fa-exclamation-circle mr-1" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
