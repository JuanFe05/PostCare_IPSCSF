import type { ChangeEvent } from "react";

type Props = {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  placeholder?: string;
};

export default function UserSearch({ value, onChange, onClear, placeholder }: Props) {
  return (
    <div className="flex items-center gap-2 w-full max-w-md justify-end">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder ?? "Buscar..."}
        className="w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition border-gray-300"
      />
      {value && (
        <button onClick={onClear} className="px-3 py-2 rounded bg-[#d33] hover:bg-[#b12a2a] text-white cursor-pointer">
          Limpiar
        </button>
      )}
    </div>
  );
}
