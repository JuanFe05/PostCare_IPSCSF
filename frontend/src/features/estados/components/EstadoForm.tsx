import { useForm } from 'react-hook-form';
import { FiCheckSquare } from 'react-icons/fi';
import type { EstadoAtencion, EstadoCreate } from '../types';
import { FormModal, SectionCard, FieldGroup, FormInput, FormTextarea, ModalFooter } from '../../../components/animate-ui/form-modal';

type EstadoFormProps = {
  onCancel: () => void;
  onSave?: (data: EstadoCreate) => Promise<void>;
  initial?: Partial<EstadoAtencion> | null;
  isEdit?: boolean;
  isOpen: boolean;
};

export default function EstadoForm({ onCancel, onSave, initial, isEdit = false, isOpen }: EstadoFormProps) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<any>({
    defaultValues: { nombre: initial?.nombre || '', descripcion: initial?.descripcion || '' }
  });

  const submit = handleSubmit(async (values) => {
    const nombre = values.nombre?.trim();
    const descripcion = values.descripcion?.trim() || undefined;
    if (onSave) await onSave({ nombre, descripcion });
  });

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onCancel}
      title={isEdit ? 'Editar Estado' : 'Nuevo Estado'}
      subtitle={isEdit ? 'Actualice los datos del estado' : 'Registre un nuevo estado de atención'}
      icon={<FiCheckSquare size={16} />}
      maxWidth="max-w-lg"
    >
      <form onSubmit={submit} className="space-y-5">
        <SectionCard title="Información del Estado" icon={<FiCheckSquare size={13} />} index={0}>
          <div className="space-y-4">
            <FieldGroup label="Nombre" required error={errors.nombre ? String(errors.nombre.message) : undefined}>
              <FormInput
                {...register('nombre', {
                  required: 'El nombre es obligatorio',
                  minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                  maxLength: { value: 100, message: 'Máximo 100 caracteres' }
                })}
                onBlur={(e) => setValue('nombre', e.target.value.trim())}
                placeholder="Ej: Activo, Pendiente..."
                hasError={!!errors.nombre}
              />
            </FieldGroup>

            <FieldGroup label="Descripción" error={errors.descripcion ? String((errors.descripcion as any).message) : undefined}>
              <FormTextarea
                {...register('descripcion')}
                onBlur={(e) => setValue('descripcion', e.target.value.trim())}
                rows={3}
                placeholder="Descripción breve (opcional)"
              />
            </FieldGroup>
          </div>
        </SectionCard>

        <ModalFooter onCancel={onCancel} submitLabel={isEdit ? 'Guardar cambios' : 'Guardar'} />
      </form>
    </FormModal>
  );
}
