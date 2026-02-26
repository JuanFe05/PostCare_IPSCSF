import { useEffect, useState } from "react";
import { FiEye, FiEyeOff, FiUser, FiLock, FiShield } from 'react-icons/fi';
import { useForm } from "react-hook-form";
import { getRoles } from "../Users.api";
import { MdError } from 'react-icons/md';

interface UsuarioFormProps {
  onCancel: () => void;
  onSave: (data: { username: string; email: string; role_id: number; password?: string; estado: boolean }) => void;
  initial?: { username?: string; email?: string; role_id?: number; rol?: string; password?: string; estado?: boolean };
  isEdit?: boolean;
}

export default function UserForm({ onCancel, onSave, initial, isEdit = false }: UsuarioFormProps) {
  const { register, handleSubmit, watch, reset, setFocus, formState: { errors } } = useForm();
  const [roles, setRoles] = useState<{ id: number; nombre: string }[]>([]);

  useEffect(() => {
    getRoles()
      .then((r) => setRoles(r))
      .catch((e) => console.error("Error cargando roles:", e));
  }, []);

  useEffect(() => {
    const init = initial ?? {};
    let resolvedRoleId: string = "";
    if (init.role_id !== undefined && init.role_id !== null) {
      resolvedRoleId = String(init.role_id);
    } else if (init.rol) {
      const found = roles.find((x) => String(x.nombre ?? '').trim().toLowerCase() === String(init.rol).trim().toLowerCase());
      if (found) resolvedRoleId = String(found.id);
    }

    reset({
      username: init.username ? String(init.username).toLowerCase() : "",
      email: init.email ? String(init.email).toLowerCase() : "",
      role_id: resolvedRoleId,
      estado: init.estado !== undefined ? (init.estado ? 'activo' : 'inactivo') : 'activo',
      password: undefined,
      passwordConfirm: undefined,
    });
  }, [initial, roles, reset]);

  const passwordValue = watch('password');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

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

  const onError = (errs: any) => {
    console.debug('UserForm validation errors:', errs);
    const firstError = Object.keys(errs || {})[0];
    if (firstError) setFocus(firstError as any);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 transform transition-all">
        {/* Header */}
        <div className="px-6 py-5 rounded-t-2xl flex-shrink-0" style={{ backgroundColor: '#1a338e' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEdit ? "Editar Usuario" : "Nuevo Usuario"}
              </h2>
              <p className="text-white text-sm">
                {isEdit ? 'Actualice los datos del usuario' : 'Registre un nuevo usuario'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit, onError)} className="p-6">
          <div className="space-y-6">
            {/* Sección: Información Básica */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiUser className="text-blue-600" />
                Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Usuario */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Usuario <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("username", {
                      required: 'Usuario es obligatorio',
                      minLength: { value: 3, message: 'Mínimo 3 caracteres' },
                      setValueAs: (v: string) => (v ?? '').toLowerCase()
                    })}
                    type="text"
                    placeholder="Nombre de usuario"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {errors.username && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <MdError size={16} />
                      <p className="text-xs">{String((errors.username as any).message)}</p>
                    </div>
                  )}
                </div>

                {/* Correo */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Correo <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("email", {
                      required: 'Correo es obligatorio',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo inválido' },
                      setValueAs: (v: string) => (v ?? '').toLowerCase()
                    })}
                    type="email"
                    placeholder="correo@dominio.com"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {errors.email && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <MdError size={16} />
                      <p className="text-xs">{String((errors.email as any).message)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sección: Seguridad */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiLock className="text-blue-600" />
                Seguridad
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contraseña */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contraseña{isEdit ? ' (opcional)' : ''} <span className="text-red-500">*</span>
                  </label>
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
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(s => !s)}
                      className="absolute inset-y-0 right-2 flex items-center text-gray-500 cursor-pointer"
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <MdError size={16} />
                      <p className="text-xs">{String((errors.password as any).message)}</p>
                    </div>
                  )}
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmar contraseña{isEdit ? ' (si cambia)' : ''} <span className="text-red-500">*</span>
                  </label>
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
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirm(s => !s)}
                      className="absolute inset-y-0 right-2 flex items-center text-gray-500 cursor-pointer"
                    >
                      {showPasswordConfirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {errors.passwordConfirm && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <MdError size={16} />
                      <p className="text-xs">{String((errors.passwordConfirm as any).message)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sección: Permisos y Estado */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiShield className="text-blue-600" />
                Permisos y Estado
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Rol */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rol <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("role_id", { required: 'Selecciona un rol' })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={roles.length === 0}
                  >
                    <option value="">{roles.length === 0 ? 'Cargando roles...' : 'Selecciona un rol'}</option>
                    {roles.map((r) => (
                      <option key={r.id} value={String(r.id)}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.role_id && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <MdError size={16} />
                      <p className="text-xs">{String((errors.role_id as any).message)}</p>
                    </div>
                  )}
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estado <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("estado", { required: 'Selecciona un estado' })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value={"activo"}>Activo</option>
                    <option value={"inactivo"}>Inactivo</option>
                  </select>
                  {errors.estado && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <MdError size={16} />
                      <p className="text-xs">{String((errors.estado as any).message)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-red-400 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-lg" style={{ backgroundColor: '#1a338e' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#152156')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1a338e')}
              disabled={roles.length === 0 && !isEdit}
            >
              {isEdit ? "Guardar cambios" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
