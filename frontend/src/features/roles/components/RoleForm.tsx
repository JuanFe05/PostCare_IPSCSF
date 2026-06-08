import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiShield } from 'react-icons/fi';
import { FormModal, SectionCard, FieldGroup, FormInput, FormTextarea, ModalFooter } from '../../../components/animate-ui/form-modal';

interface RoleFormProps {
  onCancel: () => void;
  onSave: (data: { id?: number; nombre: string; descripcion?: string }) => void;
  initial?: { id?: number; nombre?: string; descripcion?: string } | null;
  isEdit?: boolean;
  isOpen: boolean;
}

export default function RoleForm({ onCancel, onSave, initial = null, isEdit = false, isOpen }: RoleFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>();

  useEffect(() => {
    if (!initial) {
      reset({ nombre: '', descripcion: '' });
      return;
    }
    reset({ nombre: initial.nombre ?? '', descripcion: initial.descripcion ?? '' });
  }, [initial, reset]);

  const onSubmit = (data: any) => {
    onSave({
      id: initial?.id,
      nombre: String(data.nombre ?? '').trim(),
      descripcion: String(data.descripcion ?? '').trim(),
    });
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onCancel}
      title={isEdit ? 'Editar Rol' : 'Nuevo Rol'}
      subtitle={isEdit ? 'Actualice los datos del rol' : 'Registre un nuevo rol del sistema'}
      icon={<FiShield size={16} />}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <SectionCard title="Información del Rol" icon={<FiShield size={13} />} index={0}>
          <div className="space-y-4">
            <FieldGroup label="Nombre" required={!isEdit} error={errors.nombre ? String((errors.nombre as any).message) : undefined}>
              <FormInput
                {...(isEdit
                  ? register('nombre')
                  : register('nombre', { required: 'Nombre es obligatorio', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })
                )}
                readOnly={isEdit}
                placeholder="Nombre del rol"
                disabled={isEdit}
                hasError={!!errors.nombre}
              />
            </FieldGroup>
            <FieldGroup label="Descripción" error={errors.descripcion ? String((errors.descripcion as any).message) : undefined}>
              <FormTextarea
                {...register('descripcion', { maxLength: { value: 255, message: 'Máximo 255 caracteres' } })}
                rows={3}
                placeholder="Descripción del rol (opcional)"
                hasError={!!errors.descripcion}
              />
            </FieldGroup>
          </div>
        </SectionCard>
        <ModalFooter onCancel={onCancel} submitLabel={isEdit ? 'Guardar cambios' : 'Guardar'} />
      </form>
    </FormModal>
  );
}
