import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Paciente, PacienteUpdateDto } from '../types';
import { getTiposDocumento } from '../../atenciones/Atencion.api';
import { getPacienteById } from '../Paciente.api';

type PacienteFormProps = {
  onCancel: () => void;
  onSave?: (data: any) => Promise<void>;
  onUpdate?: (id: string, data: PacienteUpdateDto) => Promise<void>;
  initialData?: Paciente | null;
  isEditMode?: boolean;
};

export default function PacienteForm({ onCancel, onSave, onUpdate, initialData, isEditMode = false }: PacienteFormProps) {
  const [tiposDocumento, setTiposDocumento] = useState<any[]>([]);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<any>({
    defaultValues: {
      idTipoDocumento: '0',
      idPaciente: '',
      primerNombre: '',
      segundoNombre: '',
      primerApellido: '',
      segundoApellido: '',
      telefonoUno: '',
      telefonoDos: '',
      email: ''
    }
  });

  useEffect(() => {
    getTiposDocumento()
      .then(setTiposDocumento)
      .catch(err => console.error('Error cargando tipos documento:', err));
  }, []);

  useEffect(() => {
    if (isEditMode && initialData?.id) {
      // ensure we have freshest paciente info
      getPacienteById(initialData.id)
        .then(p => {
          reset({
            idTipoDocumento: String(p.id_tipo_documento),
            idPaciente: p.id,
            primerNombre: p.primer_nombre,
            segundoNombre: p.segundo_nombre || '',
            primerApellido: p.primer_apellido,
            segundoApellido: p.segundo_apellido || '',
            telefonoUno: p.telefono_uno || '',
            telefonoDos: p.telefono_dos || '',
            email: p.email || ''
          });
        })
        .catch(err => console.error('Error cargando paciente:', err));
    }
  }, [isEditMode, initialData, reset]);

  const onSubmit = handleSubmit(async (values) => {
    // normalize
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
        primer_nombre: primerNombreNorm,
        segundo_nombre: segundoNombreNorm,
        primer_apellido: primerApellidoNorm,
        segundo_apellido: segundoApellidoNorm,
        telefono_uno: telefonoUnoNorm,
        telefono_dos: telefonoDosNorm,
        email: emailNorm
      };

      if (onUpdate) {
        await onUpdate(initialData.id, data);
      }
      return;
    }

    if (onSave) {
      await onSave({
        id: values.idPaciente,
        id_tipo_documento: values.idTipoDocumento ? Number(values.idTipoDocumento) : undefined,
        primer_nombre: primerNombreNorm,
        segundo_nombre: segundoNombreNorm,
        primer_apellido: primerApellidoNorm,
        segundo_apellido: segundoApellidoNorm,
        telefono_uno: telefonoUnoNorm,
        telefono_dos: telefonoDosNorm,
        email: emailNorm
      });
    }
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-[700px] border border-gray-200 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">{isEditMode ? 'Editar Paciente' : 'Nuevo Paciente'}</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento <span className="text-red-500">*</span></label>
            <select {...register('idTipoDocumento', { validate: (v) => v !== '0' || 'Seleccione un tipo' })}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition text-sm">
              <option value={'0'}>Seleccione un tipo</option>
              {tiposDocumento.map(t => (<option key={t.id} value={String(t.id)}>{t.descripcion}</option>))}
            </select>
            {errors.idTipoDocumento && <p className="text-red-500 text-xs mt-1">{String(errors.idTipoDocumento.message)}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de Documento <span className="text-red-500">*</span></label>
            <input {...register('idPaciente', { required: 'El número de documento es obligatorio' })}
              type="text" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg" disabled={isEditMode} />
            {errors.idPaciente && <p className="text-red-500 text-xs mt-1">{String(errors.idPaciente.message)}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primer Nombre <span className="text-red-500">*</span></label>
            <input {...register('primerNombre', { required: 'Obligatorio', minLength: { value: 2, message: 'Mínimo 2 caracteres' }, maxLength: { value: 20, message: 'Máximo 20' }, pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: 'Solo letras' } })}
              type="text" onBlur={(e) => setValue('primerNombre', e.target.value.trim().toUpperCase())}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg" />
            {errors.primerNombre && <p className="text-red-500 text-xs mt-1">{String(errors.primerNombre.message)}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Segundo Nombre</label>
            <input {...register('segundoNombre', { validate: (v) => !v || ((v.length >= 2 && v.length <= 20) && /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(v)) || 'Solo letras y entre 2 y 20 caracteres' })}
              type="text" onBlur={(e) => setValue('segundoNombre', e.target.value.trim().toUpperCase())}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg" />
            {errors.segundoNombre && <p className="text-red-500 text-xs mt-1">{String(errors.segundoNombre.message)}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Primer Apellido <span className="text-red-500">*</span></label>
            <input {...register('primerApellido', { required: 'Obligatorio', minLength: { value: 2, message: 'Mínimo 2 caracteres' }, maxLength: { value: 20, message: 'Máximo 20' }, pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: 'Solo letras' } })}
              type="text" onBlur={(e) => setValue('primerApellido', e.target.value.trim().toUpperCase())}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg" />
            {errors.primerApellido && <p className="text-red-500 text-xs mt-1">{String(errors.primerApellido.message)}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Segundo Apellido</label>
            <input {...register('segundoApellido', { validate: (v) => !v || ((v.length >= 2 && v.length <= 20) && /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(v)) || 'Solo letras y entre 2 y 20 caracteres' })}
              type="text" onBlur={(e) => setValue('segundoApellido', e.target.value.trim().toUpperCase())}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg" />
            {errors.segundoApellido && <p className="text-red-500 text-xs mt-1">{String(errors.segundoApellido.message)}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono 1 <span className="text-red-500">*</span></label>
            <input {...register('telefonoUno', { required: 'El teléfono 1 es obligatorio', pattern: { value: /^\d{7,10}$/, message: 'Solo números (7-10 dígitos)' } })}
              type="tel" inputMode="numeric" onBlur={(e) => setValue('telefonoUno', e.target.value.trim())}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg" />
            {errors.telefonoUno && <p className="text-red-500 text-xs mt-1">{String(errors.telefonoUno.message)}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono 2</label>
            <input {...register('telefonoDos', { validate: (v) => !v || /^\d{7,10}$/.test(v) || 'Solo números (7-10 dígitos)' })}
              type="tel" inputMode="numeric" onBlur={(e) => setValue('telefonoDos', e.target.value.trim())}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg" />
            {errors.telefonoDos && <p className="text-red-500 text-xs mt-1">{String(errors.telefonoDos.message)}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
          <input {...register('email', { required: 'El email es obligatorio', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Formato inválido' } })}
            type="email" onBlur={(e) => setValue('email', e.target.value.trim().toLowerCase())}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{String(errors.email.message)}</p>}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onCancel} className="px-4 py-1.5 rounded-lg text-white cursor-pointer" style={{ backgroundColor: '#e63946' }}>Cancelar</button>
          <button type="submit" className="px-5 py-1.5 rounded-lg text-white font-medium cursor-pointer" style={{ backgroundColor: '#1938bc' }}>Guardar</button>
        </div>
      </form>
    </div>
  );
}
