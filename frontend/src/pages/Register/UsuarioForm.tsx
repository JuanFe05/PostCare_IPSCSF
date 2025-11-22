import { useState } from "react";

interface UsuarioFormProps {
  onCancel: () => void;
  onSave: (data: { username: string; email: string; rol: string; password: string; estado: boolean }) => void;
  initial?: { username?: string; email?: string; rol?: string; password?: string; estado?: boolean };
  isEdit?: boolean;
}

export default function UsuarioForm({ onCancel, onSave, initial = {}, isEdit = false }: UsuarioFormProps) {
  const [username, setUsername] = useState(initial.username || "");
  const [email, setEmail] = useState(initial.email || "");
  const [rol, setRol] = useState(initial.rol || "");
  const [password, setPassword] = useState(initial.password || "");
  const [estado, setEstado] = useState(initial.estado ?? true);

  return (
    <div className="bg-white p-6 rounded shadow w-96">
      <h3 className="text-xl font-bold mb-4">{isEdit ? "Editar usuario" : "Nuevo usuario"}</h3>
      <div className="mb-2">
        <input
          type="text"
          placeholder="Usuario"
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
          <option value="">Selecciona un rol</option>
          <option value="ADMINISTRADOR">Administrador</option>
          <option value="ASESOR">Asesor</option>
        </select>
        {!isEdit && (
          <input
            type="password"
            placeholder="Contraseña"
            className="border p-2 rounded w-full mb-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        )}
        <select
          className="border p-2 rounded w-full mb-2"
          value={estado ? "activo" : "inactivo"}
          onChange={e => setEstado(e.target.value === "activo")}
        >
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <button
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
          onClick={() => onSave({ username, email, rol, password, estado })}
        >
          {isEdit ? "Guardar cambios" : "Guardar"}
        </button>
      </div>
    </div>
  );
}