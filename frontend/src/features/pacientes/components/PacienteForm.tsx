import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiUser, FiPhone, FiMail, FiFileText } from 'react-icons/fi';
import type { Paciente, PacienteUpdateDto } from '../types';
import { getTiposDocumento } from '../../atenciones/Atencion.api';
import { getPacienteById } from '../Paciente.api';
import { FormModal, SectionCard, FieldGroup, FormInput, FormSelect, ModalFooter } from '../../../components/animate-ui/form-modal';

type PacienteFormProps = {
  onCancel: () => void;
  onSave?: (data: any) => Promise<void>;
  onUpdate?: (id: string, data: PacienteUpdateDto) => Promise<void>;
  initialData?: Paciente | null;
  isEditMode?: boolean;
  isOpen: boolean;
};

export default function PacienteForm({ onCancel, onSave, onUpdate, initialData, isEditMode = false, isOpen }: PacienteFormProps) {
  const [tiposDocumento, setTiposDocumento] = useState<any[]>([]);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<any>({
    defaultValues: {
      idTipoDocumento: '0', idPaciente: '', primerNombre: '', segundoNombre: '',
      primerApellido: '', segundoApellido: '', telefonoUno: '', telefonoDos: '', email: ''
    }
  });

  useEffect(() => {
    getTiposDocumento().then(setTiposDocumento).catch(err => console.error('Error cargando tipos documento:', err));
  }, []);

  useEffect(() => {
    if (isEditMode && initialData?.id) {
      getPacienteById(initialData.id).then(p => {
        reset({
          idTipoDocumento: String(p.id_tipo_documento), idPaciente: p.id,
          primerNombre: p.primer_nombre, segundoNombre: p.segundo_nombre || '',
          primerApellido: p.primer_apellido, segundoApellido: p.segundo_apellido || '',
          telefonoUno: p.telefono_uno || '', telefonoDos: p.telefono_dos || '', email: p.email || ''
        });
      }).catch(err => console.error('Error cargando paciente:', err));
    }
  }, [isEditMode, initialData, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const emailNorm = values.email?.trim().toLowerCase() || undefined;
    const primerNombreNorm = values.primerNombre?.trim().toUpperCase();
    const segundoNombreNorm = values.segundoNombre?.trim() ? values.segundoNombre.trim().toUpperCase() : undefined;
    const primerApellidoNorm = values.primerApellido?.trim().toUpperCase();
    const segundoApellidoNorm = values.segundoApellido?.trim() ? values.segundoApellido.trim().toUpperCase() : undefined;
    const telefonoUnoNorm = values.telefonoUno?.trim() || undefined;
    const telefonoDosNorm = values.telefonoDos?.trim() || undefined;
    if (isEditMode && initialData) {
      const data: PacienteUpdateDto = {
        id_tipo_documento: values.idTipoDocumento ? Number(values.idTipoDocumento) : undefined,
        primer_nombre: primerNombreNorm, segundo_nombre: segundoNombreNorm,
        primer_apellido: primerApellidoNorm, segundo_apellido: segundoApellidoNorm,
        telefono_uno: telefonoUnoNorm, telefono_dos: telefonoDosNorm, email: emailNorm
      };
      if (onUpdate) await onUpdate(initialData.id, data);
      return;
    }
    if (onSave) {
      await onSave({
        id: values.idPaciente, id_tipo_documento: values.idTipoDocumento ? Number(values.idTipoDocumento) : undefined,
        primer_nombre: primerNombreNorm, segundo_nombre: segundoNombreNorm,
        primer_apellido: primerApellidoNorm, segundo_apellido: segundoApellidoNorm,
        telefono_uno: telefonoUnoNorm, telefono_dos: telefonoDosNorm, email: emailNorm
      });
    }
  });

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onCancel}
      title={isEditMode ? 'Editar Paciente' : 'Nuevo Paciente'}
      subtitle={isEditMode ? 'Actualice los datos del paciente' : 'Registre un nuevo paciente'}
      icon={<FiUser size={16} />}
      maxWidth="max-w-2xl"
      maxHeight="max-h-[90vh]"
      scrollable
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {/* Identificaci�n */}
        <SectionCard title="Identificaci�n" icon={<FiFileText size={13} />} index={0}>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Tipo de Documento" required error={errors.idTipoDocumento ? String(errors.idTipoDocumento.message) : undefined}>
              <FormSelect
                {...register('idTipoDocumento', { validate: (v) => v !== '0' || 'Seleccione un tipo' })}
                hasError={!!errors.idTipoDocumento}
              >
                <option value="0">Seleccione un tipo</option>
                {tiposDocumento.map(t => <option key={t.id} value={String(t.id)}>{t.descripcion}</option>)}
              </FormSelect>
            </FieldGroup>
            <FieldGroup label="N�mero de Documento" required error={errors.idPaciente ? String(errors.idPaciente.message) : undefined}>
              <FormInput
                {...register('idPaciente', { required: 'El n�mero de documento es obligatorio' })}
                placeholder="N�mero de documento"
                disabled={isEditMode}
                hasError={!!errors.idPaciente}
              />
            </FieldGroup>
          </div>
        </SectionCard>

        {/* Nombres y Apellidos */}
        <SectionCard title="Nombres y Apellidos" icon={<FiUser size={13} />} index={1}>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Primer Nombre" required error={errors.primerNombre ? String(errors.primerNombre.message) : undefined}>
              <FormInput
                {...register('primerNombre', { required: 'Obligatorio', minLength: { value: 2, message: 'M�nimo 2' }, maxLength: { value: 20, message: 'M�ximo 20' }, pattern: { value: /^[A-Za-z\s]+$/, message: 'Solo letras' } })}
                placeholder="Primer nombre"
                onBlur={(e) => setValue('primerNombre', e.target.value.trim().toUpperCase())}
                hasError={!!errors.primerNombre}
              />
            </FieldGroup>
            <FieldGroup label="Segundo Nombre" error={errors.segundoNombre ? String(errors.segundoNombre.message) : undefined}>
              <FormInput
                {...register('segundoNombre', { validate: (v) => !v || (v.length >= 2 && v.length <= 20 && /^[A-Za-z\s]+$/.test(v)) || 'Solo letras (2-20)' })}
                placeholder="Segundo nombre (opcional)"
                onBlur={(e) => setValue('segundoNombre', e.target.value.trim().toUpperCase())}
                hasError={!!errors.segundoNombre}
              />
            </FieldGroup>
            <FieldGroup label="Primer Apellido" required error={errors.primerApellido ? String(errors.primerApellido.message) : undefined}>
              <FormInput
                {...register('primerApellido', { required: 'Obligatorio', minLength: { value: 2, message: 'M�nimo 2' }, maxLength: { value: 20, message: 'M�ximo 20' }, pattern: { value: /^[A-Za-z\s]+$/, message: 'Solo letras' } })}
                placeholder="Primer apellido"
                onBlur={(e) => setValue('primerApellido', e.target.value.trim().toUpperCase())}
                hasError={!!errors.primerApellido}
              />
            </FieldGroup>
            <FieldGroup label="Segundo Apellido" error={errors.segundoApellido ? String(errors.segundoApellido.message) : undefined}>
              <FormInput
                {...register('segundoApellido', { validate: (v) => !v || (v.length >= 2 && v.length <= 20 && /^[A-Za-z\s]+$/.test(v)) || 'Solo letras (2-20)' })}
                placeholder="Segundo apellido (opcional)"
                onBlur={(e) => setValue('segundoApellido', e.target.value.trim().toUpperCase())}
                hasError={!!errors.segundoApellido}
              />
            </FieldGroup>
          </div>
        </SectionCard>

        {/* Contacto */}
        <SectionCard title="Informaci�n de Contacto" icon={<FiPhone size={13} />} index={2}>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Tel�fono 1" required error={errors.telefonoUno ? String(errors.telefonoUno.message) : undefined}>
              <FormInput
                {...register('telefonoUno', { required: 'El tel�fono 1 es obligatorio', pattern: { value: /^\d{7,10}$/, message: 'Solo n�meros (7-10 d�gitos)' } })}
                type="tel" inputMode="numeric" placeholder="3001234567"
                onBlur={(e) => setValue('telefonoUno', e.target.value.trim())}
                hasError={!!errors.telefonoUno}
                icon={<FiPhone size={14} />}
              />
            </FieldGroup>
            <FieldGroup label="Tel�fono 2" error={errors.telefonoDos ? String(errors.telefonoDos.message) : undefined}>
              <FormInput
                {...register('telefonoDos', { validate: (v) => !v || /^\d{7,10}$/.test(v) || 'Solo n�meros (7-10 d�gitos)' })}
                type="tel" inputMode="numeric" placeholder="Tel�fono alternativo (opcional)"
                onBlur={(e) => setValue('telefonoDos', e.target.value.trim())}
                hasError={!!errors.telefonoDos}
                icon={<FiPhone size={14} />}
              />
            </FieldGroup>
            <div className="col-span-2">
              <FieldGroup label="Email" required error={errors.email ? String(errors.email.message) : undefined}>
                <FormInput
                  {...register('email', { required: 'El email es obligatorio', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Formato inv�lido' } })}
                  type="email" placeholder="correo@dominio.com"
                  onBlur={(e) => setValue('email', e.target.value.trim().toLowerCase())}
                  hasError={!!errors.email}
                  icon={<FiMail size={14} />}
                />
              </FieldGroup>
            </div>
          </div>
        </SectionCard>

        <ModalFooter onCancel={onCancel} submitLabel={isEditMode ? 'Guardar cambios' : 'Guardar'} />
      </form>
    </FormModal>
  );
}

