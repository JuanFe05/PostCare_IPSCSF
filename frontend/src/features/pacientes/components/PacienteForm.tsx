import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { MdError } from 'react-icons/md';
import { FiUser, FiPhone } from 'react-icons/fi';
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
      if (onUpdate) await onUpdate(initialData.id, data);
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

  const fieldClass = (hasError: boolean) =>
    `w-full px-4 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
      hasError ? 'border-red-400 bg-red-50' : 'border-gray-300'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 rounded-t-2xl flex-shrink-0" style={{ backgroundColor: '#1a338e' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEditMode ? 'Editar Paciente' : 'Nuevo Paciente'}
              </h2>
              <p className="text-blue-200 text-sm">
                {isEditMode ? 'Actualice los datos del paciente' : 'Registre un nuevo paciente'}
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="text-white/70 hover:text-white text-2xl leading-none cursor-pointer transition-colors"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} className="p-6 overflow-y-auto flex-1">
          <div className="space-y-5">

            {/* Identificacion */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiUser className="text-blue-600" />
                Identificacion
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Documento <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('idTipoDocumento', { validate: (v) => v !== '0' || 'Seleccione un tipo' })}
                    className={fieldClass(!!errors.idTipoDocumento)}
                  >
                    <option value="0">Seleccione un tipo</option>
                    {tiposDocumento.map(t => (
                      <option key={t.id} value={String(t.id)}>{t.descripcion}</option>
                    ))}
                  </select>
                  {errors.idTipoDocumento && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <MdError size={16} />
                      <p className="text-xs">{String(errors.idTipoDocumento.message)}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Numero de Documento <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('idPaciente', { required: 'El numero de documento es obligatorio' })}
                    type="text"
                    placeholder="Numero de documento"
                    disabled={isEditMode}
                    className={`${fieldClass(!!errors.idPaciente)} ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                  {errors.idPaciente && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <MdError size={16} />
                      <p className="text-xs">{String(errors.idPaciente.message)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Nombres y Apellidos */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiUser className="text-blue-600" />
                Nombres y Apellidos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Primer Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('primerNombre', {
                      required: 'Obligatorio',
                      minLength: { value: 2, message: 'Minimo 2 caracteres' },
                      maxLength: { value: 20, message: 'Maximo 20' },
                      pattern: { value: /^[A-Za-z\s]+$/, message: 'Solo letras' }
                    })}
                    type="text"
                    placeholder="Primer nombre"
                    onBlur={(e) => setValue('primerNombre', e.target.value.trim().toUpperCase())}
                    className={fieldClass(!!errors.primerNombre)}
                  />
                  {errors.primerNombre && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <MdError size={16} />
                      <p className="text-xs">{String(errors.primerNombre.message)}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Segundo Nombre</label>
                  <input
                    {...register('segundoNombre', {
                      validate: (v) => !v || (v.length >= 2 && v.length <= 20 && /^[A-Za-z\s]+$/.test(v)) || 'Solo letras, entre 2 y 20 caracteres'
                    })}
                    type="text"
                    placeholder="Segundo nombre (opcional)"
                    onBlur={(e) => setValue('segundoNombre', e.target.value.trim().toUpperCase())}
                    className={fieldClass(!!errors.segundoNombre)}
                  />
                  {errors.segundoNombre && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <MdError size={16} />
                      <p className="text-xs">{String(errors.segundoNombre.message)}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Primer Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('primerApellido', {
                      required: 'Obligatorio',
                      minLength: { value: 2, message: 'Minimo 2 caracteres' },
                      maxLength: { value: 20, message: 'Maximo 20' },
                      pattern: { value: /^[A-Za-z\s]+$/, message: 'Solo letras' }
                    })}
                    type="text"
                    placeholder="Primer apellido"
                    onBlur={(e) => setValue('primerApellido', e.target.value.trim().toUpperCase())}
                    className={fieldClass(!!errors.primerApellido)}
                  />
                  {errors.primerApellido && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <MdError size={16} />
                      <p className="text-xs">{String(errors.primerApellido.message)}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Segundo Apellido</label>
                  <input
                    {...register('segundoApellido', {
                      validate: (v) => !v || (v.length >= 2 && v.length <= 20 && /^[A-Za-z\s]+$/.test(v)) || 'Solo letras, entre 2 y 20 caracteres'
                    })}
                    type="text"
                    placeholder="Segundo apellido (opcional)"
                    onBlur={(e) => setValue('segundoApellido', e.target.value.trim().toUpperCase())}
                    className={fieldClass(!!errors.segundoApellido)}
                  />
                  {errors.segundoApellido && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <MdError size={16} />
                      <p className="text-xs">{String(errors.segundoApellido.message)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Informacion de Contacto */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiPhone className="text-blue-600" />
                Informacion de Contacto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Telefono 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('telefonoUno', {
                      required: 'El telefono 1 es obligatorio',
                      pattern: { value: /^\d{7,10}$/, message: 'Solo numeros (7-10 digitos)' }
                    })}
                    type="tel"
                    inputMode="numeric"
                    placeholder="3001234567"
                    onBlur={(e) => setValue('telefonoUno', e.target.value.trim())}
                    className={fieldClass(!!errors.telefonoUno)}
                  />
                  {errors.telefonoUno && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <MdError size={16} />
                      <p className="text-xs">{String(errors.telefonoUno.message)}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Telefono 2</label>
                  <input
                    {...register('telefonoDos', {
                      validate: (v) => !v || /^\d{7,10}$/.test(v) || 'Solo numeros (7-10 digitos)'
                    })}
                    type="tel"
                    inputMode="numeric"
                    placeholder="Telefono alternativo (opcional)"
                    onBlur={(e) => setValue('telefonoDos', e.target.value.trim())}
                    className={fieldClass(!!errors.telefonoDos)}
                  />
                  {errors.telefonoDos && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <MdError size={16} />
                      <p className="text-xs">{String(errors.telefonoDos.message)}</p>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('email', {
                      required: 'El email es obligatorio',
                      pattern: { value: /^\S+@\S+\.\S+$/, message: 'Formato invalido' }
                    })}
                    type="email"
                    placeholder="correo@dominio.com"
                    onBlur={(e) => setValue('email', e.target.value.trim().toLowerCase())}
                    className={fieldClass(!!errors.email)}
                  />
                  {errors.email && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <MdError size={16} />
                      <p className="text-xs">{String(errors.email.message)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-red-400 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              style={{ backgroundColor: '#1a338e' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#152156')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1a338e')}
            >
              {isEditMode ? 'Guardar cambios' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}