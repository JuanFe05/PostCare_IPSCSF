import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getRoles } from "../api";

interface UsuarioFormProps {
  onCancel: () => void;
  onSave: (data: { username: string; email: string; role_id: number; password?: string; estado: boolean }) => void;
  initial?: { username?: string; email?: string; role_id?: number; rol?: string; password?: string; estado?: boolean };
  isEdit?: boolean;
}

export default function UserForm({ onCancel, onSave, initial = {}, isEdit = false }: UsuarioFormProps) {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const [roles, setRoles] = useState<{ id: number; nombre: string }[]>([]);

  useEffect(() => {
    getRoles()
      .then((r) => setRoles(r))
      .catch((e) => console.error("Error cargando roles:", e));
  }, []);

  // Reset form values when `initial` or `roles` change so selects/defaults are applied correctly
  useEffect(() => {
    // determine role_id: prefer initial.role_id, else try matching initial.rol (role name) to loaded roles
    let resolvedRoleId: string = "";
    if (initial.role_id !== undefined && initial.role_id !== null) {
      resolvedRoleId = String(initial.role_id);
    } else if (initial.rol) {
      const found = roles.find((x) => String(x.nombre ?? '').trim().toLowerCase() === String(initial.rol).trim().toLowerCase());
      if (found) resolvedRoleId = String(found.id);
    }

    reset({
      username: initial.username ? String(initial.username).toLowerCase() : "",
      email: initial.email ? String(initial.email).toLowerCase() : "",
      role_id: resolvedRoleId,
      estado: initial.estado !== undefined ? (initial.estado ? 'activo' : 'inactivo') : 'activo',
      password: undefined,
      passwordConfirm: undefined,
    });
  }, [initial, roles, reset]);

  const passwordValue = watch('password');
  const roleValue = watch('role_id');

  const onSubmit = (data: any) => {
    const payload = {
      username: String(data.username ?? '').toLowerCase(),
      email: String(data.email ?? '').toLowerCase(),
      role_id: Number(data.role_id),
      password: data.password,
      estado: data.estado === undefined ? true : (String(data.estado) === 'activo'),
    };
    onSave(payload);
  };

  useEffect(() => {
    console.debug('UserForm: watched role_id =', roleValue);
  }, [roleValue]);

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="bg-white p-8 rounded-xl shadow-xl w-[420px] border border-gray-200"
    >
      <h3 className="text-2xl font-semibold mb-6 text-gray-800">
        {isEdit ? "Editar usuario" : "Nuevo usuario"}
      </h3>

      <div className="grid gap-5">

        {/* Usuario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
          <input
            {...register("username", { 
              required: 'Usuario es obligatorio', 
              minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              setValueAs: (v: string) => (v ?? '').toLowerCase()
            })}
            type="text"
            placeholder="Nombre de usuario"
            className={`w-full p-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.username && <p className="text-xs text-red-600 mt-1">{String((errors.username as any).message)}</p>}
        </div>

        {/* Correo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
          <input
            {...register("email", { 
              required: 'Correo es obligatorio', 
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' },
              setValueAs: (v: string) => (v ?? '').toLowerCase()
            })}
            type="email"
            placeholder="correo@dominio.com"
            className={`w-full p-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{String((errors.email as any).message)}</p>}
        </div>

        {/* Rol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select
            {...register("role_id", { required: 'Selecciona un rol', setValueAs: (v: string) => v })}
            defaultValue={initial.role_id !== undefined && initial.role_id !== null ? String(initial.role_id) : ""}
            className={`w-full p-2.5 border rounded-lg shadow-sm bg-white focus:ring-2 focus:ring-blue-500 transition ${errors.role_id ? 'border-red-500' : 'border-gray-300'}`}
            disabled={roles.length === 0}
          >
            <option value="">{roles.length === 0 ? 'Cargando roles...' : 'Selecciona un rol'}</option>
            {roles.map((r) => (
              <option key={r.id} value={String(r.id)}>
                {r.nombre}
              </option>
            ))}
          </select>
          {errors.role_id && <p className="text-xs text-red-600 mt-1">{String((errors.role_id as any).message)}</p>}
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña{isEdit ? ' (opcional)' : ''}
          </label>
          <input
            {...register("password", {
              validate: (val: string) => {
                if (!val) return true;
                return val.length >= 6 || 'Mínimo 6 caracteres';
              },
              ...(isEdit ? {} : { required: 'Contraseña obligatoria' }),
            })}
            type="password"
            placeholder="********"
            className={`w-full p-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.password && <p className="text-xs text-red-600 mt-1">{String((errors.password as any).message)}</p>}
        </div>

        {/* Confirmar */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmar contraseña{isEdit ? ' (si cambia)' : ''}
          </label>
          <input
            {...register("passwordConfirm", {
              validate: (val: string) => {
                const pwd = passwordValue;
                if (!pwd && !val) return true;
                return val === pwd || 'Las contraseñas no coinciden';
              }
            })}
            type="password"
            placeholder="Repite la contraseña"
            className={`w-full p-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition ${errors.passwordConfirm ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.passwordConfirm && <p className="text-xs text-red-600 mt-1">{String((errors.passwordConfirm as any).message)}</p>}
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select 
            {...register("estado", { required: 'Selecciona un estado' })}
            className={`w-full p-2.5 border rounded-lg shadow-sm bg-white focus:ring-2 focus:ring-blue-500 transition ${errors.estado ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value={"activo"}>Activo</option>
            <option value={"inactivo"}>Inactivo</option>
          </select>
          {errors.estado && <p className="text-xs text-red-600 mt-1">{String((errors.estado as any).message)}</p>}
        </div>

      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 mt-8">
        <button
          type="button"
          className="px-4 py-2 rounded-lg text-white transition shadow cursor-pointer"
          style={{ backgroundColor: '#e63946' }}
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-lg text-white font-medium transition shadow cursor-pointer"
          style={{ backgroundColor: '#1938bc' }}
          disabled={roles.length === 0 && !isEdit}
        >
          {isEdit ? "Guardar cambios" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
