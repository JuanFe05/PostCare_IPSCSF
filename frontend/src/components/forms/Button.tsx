import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
}

const Button: React.FC<Props> = ({ loading, children, ...props }) => {
    return (
        <button
            {...props}
            className={`w-full py-3 rounded-lg bg-[#1938BC] text-white font-semibold 
                hover:bg-[#10298A] transition disabled:opacity-60`}
        >
            {loading ? "Cargando..." : children}
        </button>
    );
};

export default Button;