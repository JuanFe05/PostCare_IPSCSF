import { useEffect, useState } from "react";
import { FiEye, FiEyeOff, FiUser, FiLock, FiShield, FiMail } from 'react-icons/fi';
import { useForm } from "react-hook-form";
import { getRoles } from "../Users.api";
import { FormModal, SectionCard, FieldGroup, FormInput, FormSelect, ModalFooter } from '../../../components/animate-ui/form-modal';

interface UsuarioFormProps {
  onCancel: () => void;
  onSave: (data: { username: string; email: string; role_id: number; password?: string; estado: boolean }) => void;
  initial?: { username?: string; email?: string; role_id?: number; rol?: string; password?: string; estado?: boolean };
  isEdit?: boolean;
  isOpen: boolean;
}

export default function UserForm({ onCancel, onSave, initial, isEdit = false, isOpen }: UsuarioFormProps) {
  const { register, handleSubmit, watch, reset, setFocus, formState: { errors } } = useForm();
  const [roles, setRoles] = useState<{ id: number; nombre: string }[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  useEffect(() => {
    getRoles().then((r) => setRoles(r)).catch((e) => console.error("Error cargando roles:", e));
  }, []);

  useEffect(() => {
    const init = initial ?? {};
    let resolvedRoleId = "";
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
      password: undefined, passwordConfirm: undefined,
    });
  }, [initial, roles, reset]);

  const passwordValue = watch('password');

  const onSubmit = (data: any) => {
    onSave({
      username: String(data.username ?? '').toLowerCase(),
      email: String(data.email ?? '').toLowerCase(),
      role_id: Number(data.role_id),
      password: data.password,
      estado: data.estado === undefined ? true : (String(data.estado) === 'activo'),
    });
  };

  const onError = (errs: any) => {
    const firstError = Object.keys(errs || {})[0];
    if (firstError) setFocus(firstError as any);
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onCancel}
      title={isEdit ? "Editar Usuario" : "Nuevo Usuario"}
      subtitle={isEdit ? 'Actualice los datos del usuario' : 'Registre un nuevo usuario del sistema'}
      icon={<FiUser size={16} />}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-5">
        <SectionCard title="Informacion Basica" icon={<FiUser size={13} />} index={0}>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Usuario" required error={errors.username ? String((errors.username as any).message) : undefined}>
              <FormInput
                {...register("username", { required: 'Usuario es obligatorio', minLength: { value: 3, message: 'Minimo 3 caracteres' }, setValueAs: (v: string) => (v ?? '').toLowerCase() })}
                placeholder="Nombre de usuario" hasError={!!errors.username} icon={<FiUser size={14} />}
              />
            </FieldGroup>
            <FieldGroup label="Correo" required error={errors.email ? String((errors.email as any).message) : undefined}>
              <FormInput
                {...register("email", { required: 'Correo es obligatorio', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Correo invalido' }, setValueAs: (v: string) => (v ?? '').toLowerCase() })}
                type="email" placeholder="correo@dominio.com" hasError={!!errors.email} icon={<FiMail size={14} />}
              />
            </FieldGroup>
          </div>
        </SectionCard>

        <SectionCard title="Seguridad" icon={<FiLock size={13} />} index={1}>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label={isEdit ? 'Contrasena (opcional)' : 'Contrasena'} required={!isEdit} error={errors.password ? String((errors.password as any).message) : undefined}>
              <div className="relative">
                <FormInput
                  {...register("password", { validate: (val: string) => { if (!val) return true; return val.length >= 6 || 'Minimo 6 caracteres'; }, ...(isEdit ? {} : { required: 'Contrasena obligatoria' }) })}
                  type={showPassword ? 'text' : 'password'} placeholder="..." hasError={!!errors.password} icon={<FiLock size={14} />}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
            </FieldGroup>
            <FieldGroup label={isEdit ? 'Confirmar (si cambia)' : 'Confirmar contrasena'} required={!isEdit} error={errors.passwordConfirm ? String((errors.passwordConfirm as any).message) : undefined}>
              <div className="relative">
                <FormInput
                  {...register("passwordConfirm", { validate: (val: string) => { const pwd = passwordValue; if (!pwd && !val) return true; return val === pwd || 'Las contrasenas no coinciden'; } })}
                  type={showPasswordConfirm ? 'text' : 'password'} placeholder="..." hasError={!!errors.passwordConfirm} icon={<FiLock size={14} />}
                />
                <button type="button" onClick={() => setShowPasswordConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  {showPasswordConfirm ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
            </FieldGroup>
          </div>
        </SectionCard>

        <SectionCard title="Permisos y Estado" icon={<FiShield size={13} />} index={2}>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Rol" required error={errors.role_id ? String((errors.role_id as any).message) : undefined}>
              <FormSelect {...register("role_id", { required: 'Selecciona un rol' })} disabled={roles.length === 0} hasError={!!errors.role_id}>
                <option value="">{roles.length === 0 ? 'Cargando roles...' : 'Selecciona un rol'}</option>
                {roles.map((r) => <option key={r.id} value={String(r.id)}>{r.nombre}</option>)}
              </FormSelect>
            </FieldGroup>
            <FieldGroup label="Estado" required error={errors.estado ? String((errors.estado as any).message) : undefined}>
              <FormSelect {...register("estado", { required: 'Selecciona un estado' })} hasError={!!errors.estado}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </FormSelect>
            </FieldGroup>
          </div>
        </SectionCard>

        <ModalFooter onCancel={onCancel} submitLabel={isEdit ? 'Guardar cambios' : 'Guardar'} />
      </form>
    </FormModal>
  );
}