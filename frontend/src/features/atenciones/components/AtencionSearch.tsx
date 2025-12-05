import type { ChangeEvent } from 'react';

type AtencionSearchProps = {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  placeholder?: string;
};

export default function AtencionSearch({ value, onChange, onClear, placeholder = "Buscar atención" }: AtencionSearchProps) {
  return (
    <div className="relative flex-1 max-w-md">
      <input
        type="text"
        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          ✕
        </button>
      )}
    </div>
  );
}
