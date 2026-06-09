import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiList } from 'react-icons/fi';
import { FormModal, SectionCard, FieldGroup, FormInput, FormTextarea, ModalFooter } from '../../../components/animate-ui/form-modal';

interface ServiceFormProps {
  onCancel: () => void;
  onSave: (data: { nombre: string; descripcion?: string }) => void;
  initial?: { nombre?: string; descripcion?: string } | null;
  isEdit?: boolean;
  isOpen: boolean;
}

export default function ServiceForm({ onCancel, onSave, initial = null, isEdit = false, isOpen }: ServiceFormProps) {
  const { register, handleSubmit, reset, setFocus, formState: { errors } } = useForm<any>();

  useEffect(() => {
    const init = initial ?? {};
    reset({ nombre: init.nombre ?? '', descripcion: init.descripcion ?? '' });
  }, [initial, reset]);

  const onSubmit = (data: any) => {
    onSave({ nombre: String(data.nombre ?? '').trim(), descripcion: data.descripcion ? String(data.descripcion).trim() : '' });
  };

  const onError = (errs: any) => {
    const first = Object.keys(errs || {})[0];
    if (first) setFocus(first as any);
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onCancel}
      title={isEdit ? 'Editar Servicio' : 'Nuevo Servicio'}
      subtitle={isEdit ? 'Actualice los datos del servicio' : 'Registre un nuevo servicio médico'}
      icon={<FiList size={16} />}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-5">
        <SectionCard title="Información del Servicio" icon={<FiList size={13} />} index={0}>
          <div className="space-y-4">
            <FieldGroup label="Nombre del servicio" required error={errors.nombre ? String((errors.nombre as any).message) : undefined}>
              <FormInput
                {...register('nombre', { required: 'El nombre es obligatorio', minLength: { value: 2, message: 'Mínimo 2 caracteres' } })}
                placeholder="Ej: Consulta médica"
                hasError={!!errors.nombre}
              />
            </FieldGroup>
            <FieldGroup label="Descripción" error={errors.descripcion ? String((errors.descripcion as any).message) : undefined}>
              <FormTextarea
                {...register('descripcion', { maxLength: { value: 255, message: 'Máximo 255 caracteres' } })}
                rows={3}
                placeholder="Descripción breve del servicio (opcional)"
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