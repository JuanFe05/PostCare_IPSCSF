import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
    error?: string | null;
}

const Input: React.FC<Props> = ({ label, icon, error, ...props }) => {
    return (
        <div className="mb-4">
            {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
            <div className="relative">
                {icon && <div className="absolute left-3 top-3 text-gray-400">{icon}</div>}
                <input
                    {...props}
                    className={`w-full border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${icon ? 'pl-10' : ''}`}
                />
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};

export default Input;