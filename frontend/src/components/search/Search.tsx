import type { ChangeEvent } from 'react';

type Props = {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  placeholder?: string;
  title?: string;
};

export default function Search({ value, onChange, onClear, placeholder = "Buscar atención", title }: Props) {
  const inputTitle = title ?? placeholder;

  return (
    <div className="relative flex-1 max-w-md">
      <input
        type="text"
        title={inputTitle}
        className="h-10 w-full px-3 pr-10 border border-gray-300 rounded-md bg-white text-sm shadow-sm hover:shadow-md transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
