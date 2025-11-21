// src/pages/Register/UsuarioForm.tsx
import { useState } from "react";

interface UsuarioFormProps {
  onCancel: () => void;
  onSave: (data: { username: string; email: string; rol: string }) => void;
  initial?: { username?: string; email?: string; rol?: string };
  isEdit?: boolean;
}

export default function UsuarioForm({ onCancel, onSave, initial = {}, isEdit = false }: UsuarioFormProps) {
  const [username, setUsername] = useState(initial.username || "");
  const [email, setEmail] = useState(initial.email || "");
  const [rol, setRol] = useState(initial.rol || "");

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
      <h3 className="text-xl font-semibold mb-4">{isEdit ? "Editar Usuario" : "Agregar Usuario"}</h3>
      <input
        type="text"
        placeholder="Nombre"
        className="border p-2 rounded w-full mb-2"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        type="email"
        placeholder="Correo"
        className="border p-2 rounded w-full mb-2"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <select
        className="border p-2 rounded w-full mb-2"
        value={rol}
        onChange={e => setRol(e.target.value)}
      >
        <option value="">Seleccionar rol</option>
        <option value="ADMINISTRADOR">Administrador</option>
        <option value="ASESOR">Asesor</option>
      </select>
      <div className="flex justify-end gap-2 mt-4">
        <button className="px-4 py-2 rounded bg-gray-200 cursor-pointer" onClick={onCancel}>Cancelar</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer" onClick={() => onSave({ username, email, rol })}>
          {isEdit ? "Guardar cambios" : "Guardar"}
        </button>
      </div>
    </div>
  );
}
