import { useEffect, useState } from "react";
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useForm } from "react-hook-form";
import { getRoles } from "../../features/users/Users.api";

interface UsuarioFormProps {
  onCancel: () => void;
  onSave: (data: { username: string; email: string; role_id: number; password?: string; estado: boolean }) => void;
  initial?: { username?: string; email?: string; role_id?: number; rol?: string; password?: string; estado?: boolean };
  isEdit?: boolean;
}

export default function UsuarioForm({ onCancel, onSave, initial = {}, isEdit = false }: UsuarioFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm();
  const [roles, setRoles] = useState<{ id: number; nombre: string }[]>([]);

  useEffect(() => {
    // Load roles from backend
    getRoles()
      .then((r) => setRoles(r))
      .catch((e) => console.error("Error cargando roles:", e));

    // initialize values
    if (initial.username) setValue("username", initial.username);
    if (initial.email) setValue("email", initial.email);
    if (initial.role_id) setValue("role_id", initial.role_id);
    if (initial.estado !== undefined) setValue("estado", initial.estado ? 'activo' : 'inactivo');
  }, []);

  const passwordValue = watch('password');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const onSubmit = (data: any) => {
    const payload = {
      username: data.username,
      email: data.email,
      role_id: Number(data.role_id),
      password: data.password,
      // map 'activo'/'inactivo' to boolean
      estado: data.estado === undefined ? true : (String(data.estado) === 'activo'),
    };
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow w-96">
      <h3 className="text-xl font-bold mb-4">{isEdit ? "Editar usuario" : "Nuevo usuario"}</h3>
      <div className="grid gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Usuario</label>
          <input
            {...register("username", { required: 'Usuario es obligatorio', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })}
            type="text"
            placeholder="Nombre de usuario"
            className={`border p-2 rounded w-full ${errors.username ? 'border-red-500' : ''}`}
          />
          {errors.username && <p className="text-xs text-red-600 mt-1">{String((errors.username as any).message)}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Correo</label>
          <input
            {...register("email", { required: 'Correo es obligatorio', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' } })}
            type="email"
            placeholder="correo@dominio.com"
            className={`border p-2 rounded w-full ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{String((errors.email as any).message)}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Rol</label>
          <select {...register("role_id", { required: 'Selecciona un rol' })} className={`border p-2 rounded w-full ${errors.role_id ? 'border-red-500' : ''}`} disabled={roles.length === 0}>
            <option value="">{roles.length === 0 ? 'Cargando roles...' : 'Selecciona un rol'}</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
          {errors.role_id && <p className="text-xs text-red-600 mt-1">{String((errors.role_id as any).message)}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contraseña{isEdit ? ' (dejar vacío para no cambiar)' : ''}</label>
          <div className="relative">
            <input
              {...register("password", {
                validate: (val: string) => {
                  if (!val) return true;
                  return val.length >= 6 || 'Mínimo 6 caracteres';
                },
                ...(isEdit ? {} : { required: 'Contraseña obligatoria' }),
              })}
              type={showPassword ? 'text' : 'password'}
              placeholder="********"
              className={`border p-2 rounded w-full pr-10 ${errors.password ? 'border-red-500' : ''}`}
            />
            <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute inset-y-0 right-2 flex items-center text-gray-500">
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-600 mt-1">{String((errors.password as any).message)}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Confirmar contraseña{isEdit ? ' (si cambia)' : ''}</label>
          <div className="relative">
            <input
              {...register("passwordConfirm", {
                validate: (val: string) => {
                  const pwd = passwordValue;
                  if (!pwd && !val) return true;
                  return val === pwd || 'Las contraseñas no coinciden';
                }
              })}
              type={showPasswordConfirm ? 'text' : 'password'}
              placeholder="Repite la contraseña"
              className={`border p-2 rounded w-full pr-10 ${errors.passwordConfirm ? 'border-red-500' : ''}`}
            />
            <button type="button" onClick={() => setShowPasswordConfirm(s => !s)} className="absolute inset-y-0 right-2 flex items-center text-gray-500">
              {showPasswordConfirm ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.passwordConfirm && <p className="text-xs text-red-600 mt-1">{String((errors.passwordConfirm as any).message)}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Estado</label>
          <select {...register("estado", { required: 'Selecciona un estado' })} className={`border p-2 rounded w-full ${errors.estado ? 'border-red-500' : ''}`}>
            <option value="">Selecciona un estado</option>
            <option value={"activo"}>Activo</option>
            <option value={"inactivo"}>Inactivo</option>
          </select>
          {errors.estado && <p className="text-xs text-red-600 mt-1">{String((errors.estado as any).message)}</p>}
        </div>

      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button type="button" className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer" disabled={roles.length === 0 && !isEdit}>
          {isEdit ? "Guardar cambios" : "Guardar"}
        </button>
      </div>
    </form>
  );
}