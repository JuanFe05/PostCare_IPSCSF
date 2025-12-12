import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { NewAtencionConPaciente, UpdateAtencion, Atencion, TipoDocumento, Empresa, EstadoAtencion, SeguimientoAtencion, ServicioOption } from '../types';
import { getEmpresas, getEstadosAtencion, getSeguimientosAtencion, getServicios, getTiposDocumento } from '../Atencion.api';
import { getPacienteById } from '../../pacientes/Paciente.api';

type AtencionFormProps = {
  onCancel: () => void;
  onSave: (data: NewAtencionConPaciente) => Promise<void>;
  onUpdate?: (id: string, data: UpdateAtencion) => Promise<void>;
  initialData?: Atencion;
  isEditMode?: boolean;
  userId?: number;
};

export default function AtencionForm({ onCancel, onSave, onUpdate, initialData, isEditMode = false, userId }: AtencionFormProps) {
  // Form-managed fields are handled by react-hook-form (see below)
  const [selectedServicios, setSelectedServicios] = useState<number[]>(initialData?.servicios.map(s => s.id_servicio) || []);
  
  // Catálogos
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [estados, setEstados] = useState<EstadoAtencion[]>([]);
  const [seguimientos, setSeguimientos] = useState<SeguimientoAtencion[]>([]);
  const [servicios, setServicios] = useState<ServicioOption[]>([]);
  
  const [loading, setLoading] = useState(true);

  type FormValues = {
    idTipoDocumento: number;
    idPaciente: string;
    email: string;
    telefonoUno: string;
    telefonoDos?: string;
    primerNombre: string;
    segundoNombre?: string;
    primerApellido: string;
    segundoApellido?: string;
    idAtencion?: string;
    fechaIngreso?: string;
    idEmpresa?: number;
    idEstado?: number;
    idSeguimiento?: number;
    observacion?: string;
  };

  const { register, handleSubmit: rhfHandleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      idTipoDocumento: 0,
      idPaciente: initialData?.id_paciente || '',
      email: initialData?.email || '',
      telefonoUno: initialData?.telefono_uno || '',
      telefonoDos: initialData?.telefono_dos || '',
      primerNombre: initialData?.nombre_paciente ? initialData.nombre_paciente.split(' ')[0] : '',
      primerApellido: initialData?.nombre_paciente ? (initialData.nombre_paciente.split(' ')[1] || '') : '',
      idAtencion: initialData?.id_atencion?.replace('T', '') || '',
      fechaIngreso: initialData?.fecha_atencion ? initialData.fecha_atencion.split('T')[0] : '',
      idEmpresa: initialData?.id_empresa || 0,
      idEstado: initialData?.id_estado_atencion || 0,
      idSeguimiento: initialData?.id_seguimiento_atencion || 0,
      observacion: initialData?.observacion || ''
    }
  });

  useEffect(() => {
    console.log('Iniciando carga de catálogos...');
    Promise.all([
      getTiposDocumento(),
      getEmpresas(),
      getEstadosAtencion(),
      getSeguimientosAtencion(),
      getServicios()
    ])
      .then(([tipos, emp, est, seg, serv]) => {
        console.log('Tipos documento cargados:', tipos);
        console.log('Empresas cargadas:', emp);
        console.log('Estados cargados:', est);
        console.log('Seguimientos cargados:', seg);
        console.log('Servicios cargados:', serv);
        
        setTiposDocumento(tipos);
        setEmpresas(emp);
        setEstados(est);
        setSeguimientos(seg);
        setServicios(serv);
      })
      .catch(err => console.error('Error cargando datos:', err))
      .finally(() => setLoading(false));
  }, []);

  // Cargar datos del paciente en modo edición
  useEffect(() => {
    if (isEditMode && initialData?.id_paciente) {
      console.log('Cargando datos del paciente:', initialData.id_paciente);
      getPacienteById(initialData.id_paciente)
        .then(paciente => {
          console.log('Paciente cargado:', paciente);
          // sync paciente data into the form
          setValue('idTipoDocumento', paciente.id_tipo_documento);
          setValue('idPaciente', paciente.id);
          setValue('primerNombre', paciente.primer_nombre);
          setValue('segundoNombre', paciente.segundo_nombre || '');
          setValue('primerApellido', paciente.primer_apellido);
          setValue('segundoApellido', paciente.segundo_apellido || '');
          setValue('telefonoUno', paciente.telefono_uno || '');
          setValue('telefonoDos', paciente.telefono_dos || '');
          setValue('email', paciente.email || '');
        })
        .catch(err => console.error('Error cargando paciente:', err));
    }
  }, [isEditMode, initialData?.id_paciente]);

  const onSubmit = rhfHandleSubmit(async (values) => {
    // Normalize
    const emailNorm = values.email?.trim().toLowerCase() || '';
    const primerNombreNorm = values.primerNombre.trim().toUpperCase();
    const segundoNombreNorm = values.segundoNombre?.trim() ? values.segundoNombre.trim().toUpperCase() : undefined;
    const primerApellidoNorm = values.primerApellido.trim().toUpperCase();
    const segundoApellidoNorm = values.segundoApellido?.trim() ? values.segundoApellido.trim().toUpperCase() : undefined;
    const idPacienteNorm = values.idPaciente.trim();
    const telefonoUnoNorm = values.telefonoUno.trim();
    const telefonoDosNorm = values.telefonoDos?.trim() || undefined;

    if (isEditMode) {
      const updateData: UpdateAtencion = {
        id_usuario: userId,
        observacion: values.observacion?.trim() || undefined,
        servicios: selectedServicios,
        id_paciente: idPacienteNorm || undefined,
        id_tipo_documento: values.idTipoDocumento || undefined,
        telefono_uno: telefonoUnoNorm || undefined,
        telefono_dos: telefonoDosNorm,
        email: emailNorm || undefined,
        primer_nombre: primerNombreNorm,
        segundo_nombre: segundoNombreNorm,
        primer_apellido: primerApellidoNorm,
        segundo_apellido: segundoApellidoNorm
      };

      if (values.idEmpresa && values.idEmpresa !== 0) updateData.id_empresa = values.idEmpresa;
      if (values.idEstado && values.idEstado !== 0) updateData.id_estado_atencion = values.idEstado;
      if (values.idSeguimiento && values.idSeguimiento !== 0) updateData.id_seguimiento_atencion = values.idSeguimiento;
      if (values.fechaIngreso) updateData.fecha_ingreso = values.fechaIngreso;

      if (onUpdate && initialData) {
        await onUpdate(initialData.id_atencion, updateData);
      }
      return;
    }

    const data: NewAtencionConPaciente = {
      id_paciente: idPacienteNorm,
      id_tipo_documento: values.idTipoDocumento,
      primer_nombre: primerNombreNorm,
      segundo_nombre: segundoNombreNorm,
      primer_apellido: primerApellidoNorm,
      segundo_apellido: segundoApellidoNorm,
      telefono_uno: telefonoUnoNorm,
      telefono_dos: telefonoDosNorm,
      email: emailNorm,
      id_atencion: `T${values.idAtencion?.trim() || ''}`,
      fecha_ingreso: values.fechaIngreso || undefined,
      id_empresa: values.idEmpresa as number,
      id_estado_atencion: values.idEstado as number,
      id_seguimiento_atencion: values.idSeguimiento as number | undefined,
      id_usuario: userId,
      observacion: values.observacion?.trim() || undefined,
      servicios: selectedServicios
    };

    await onSave(data);
  });

  const toggleServicio = (servicioId: number) => {
    setSelectedServicios(prev => 
      prev.includes(servicioId)
        ? prev.filter(id => id !== servicioId)
        : [...prev, servicioId]
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-[700px] border border-gray-200 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          {isEditMode ? 'Editar Atención' : 'Nueva Atención con Paciente'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 cursor-pointer"
          disabled={loading}
        >
          ✕
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">Cargando datos...</div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          {/* ID Atención y Fecha Atención en la misma fila */}
          <div className="grid grid-cols-2 gap-3">
            {/* ID Atención */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Id Atención <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {!isEditMode && (
                  <span className="px-2 py-1.5 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium text-sm">T</span>
                )}
                <input
                  {...register('idAtencion', {
                    required: !isEditMode ? 'El ID de la atención es obligatorio' : undefined,
                    pattern: { value: /^\d+$/, message: 'El ID debe contener solo números' },
                    maxLength: { value: 10, message: 'El ID no debe superar 10 dígitos' }
                  })}
                  type="text"
                  inputMode="numeric"
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition text-sm"
                  placeholder=""
                  disabled={isEditMode}
                  aria-invalid={errors.idAtencion ? 'true' : 'false'}
                />
              </div>
              {errors.idAtencion && (
                <p className="text-red-500 text-xs mt-1">{String(errors.idAtencion.message)}</p>
              )}
            </div>

            {/* Fecha Atención */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Atención <span className="text-red-500">*</span>
              </label>
              <input
                {...register('fechaIngreso', { required: 'La fecha de atención es obligatoria' })}
                type="date"
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition text-sm"
                aria-invalid={errors.fechaIngreso ? 'true' : 'false'}
              />
            </div>
          </div>

          {/* Tipo de Documento y Número de Documento en la misma fila */}
          <div className="grid grid-cols-2 gap-3">
            {/* Tipo de Documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Documento <span className="text-red-500">*</span>
              </label>
              <select
                {...register('idTipoDocumento', { valueAsNumber: true, validate: (v) => v !== 0 || 'Seleccione un tipo de documento' })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition text-sm"
                aria-invalid={errors.idTipoDocumento ? 'true' : 'false'}
              >
                <option value={0}>Seleccione un tipo de documento</option>
                {tiposDocumento.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.descripcion}
                  </option>
                ))}
              </select>
              {errors.idTipoDocumento && (
                <p className="text-red-500 text-xs mt-1">{String(errors.idTipoDocumento.message)}</p>
              )}
            </div>

            {/* Número de Documento (Id paciente) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Documento (Id paciente) <span className="text-red-500">*</span>
              </label>
              <input
                {...register('idPaciente', { required: 'El número de documento es obligatorio' })}
                type="text"
                onBlur={(e) => { const v = e.target.value.trim(); setValue('idPaciente', v); }}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition text-sm"
                placeholder=""
                aria-invalid={errors.idPaciente ? 'true' : 'false'}
              />
              {errors.idPaciente && (
                <p className="text-red-500 text-xs mt-1">{String(errors.idPaciente.message)}</p>
              )}
            </div>
          </div>

          {/* Email y Empresa en la misma fila */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                {...register('email', { required: 'El email es obligatorio', pattern: { value: /^\S+@\S+\.\S+$/, message: 'El email no tiene un formato válido' } })}
                type="email"
                onBlur={(e) => { const v = e.target.value.trim().toLowerCase(); setValue('email', v); }}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition text-sm"
                placeholder=""
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{String(errors.email.message)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Empresa <span className="text-red-500">*</span>
              </label>
              <select
                {...register('idEmpresa', { valueAsNumber: true, validate: (v) => v !== 0 || 'Seleccione una empresa' })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition text-sm"
                aria-invalid={errors.idEmpresa ? 'true' : 'false'}
              >
                <option value={0}>Seleccione una empresa</option>
                {empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre}
                  </option>
                ))}
              </select>
              {errors.idEmpresa && (
                <p className="text-red-500 text-xs mt-1">{String(errors.idEmpresa.message)}</p>
              )}
            </div>
          </div>

          {/* Teléfono 1 y Teléfono 2 en la misma fila */}
          <div className="grid grid-cols-2 gap-3">
            {/* Teléfono 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono 1 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('telefonoUno', {
                  required: 'El teléfono 1 es obligatorio',
                  pattern: { value: /^\d{7,10}$/, message: 'El teléfono debe contener solo números (7-10 dígitos)' }
                })}
                type="tel"
                inputMode="numeric"
                onBlur={(e) => { const v = e.target.value.trim(); setValue('telefonoUno', v); }}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition text-sm"
                placeholder=""
                aria-invalid={errors.telefonoUno ? 'true' : 'false'}
              />
              {errors.telefonoUno && (
                <p className="text-red-500 text-xs mt-1">{String(errors.telefonoUno.message)}</p>
              )}
            </div>

            {/* Teléfono 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono 2
              </label>
              <input
                {...register('telefonoDos', {
                  validate: (v) => !v || /^\d{7,10}$/.test(v) || 'El teléfono debe contener solo números (7-10 dígitos)'
                })}
                type="tel"
                inputMode="numeric"
                onBlur={(e) => { const v = e.target.value.trim(); setValue('telefonoDos', v); }}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition text-sm"
                placeholder=""
              />
              {errors.telefonoDos && (
                <p className="text-red-500 text-xs mt-1">{String(errors.telefonoDos.message)}</p>
              )}
            </div>
          </div>

          {/* Nombre 1 y Nombre 2 en la misma fila */}
          <div className="grid grid-cols-2 gap-3">
            {/* Nombre 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre 1 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('primerNombre', {
                  required: 'El primer nombre es obligatorio',
                  validate: (v) => (v && v.length <= 20) || 'Máximo 20 caracteres',
                  pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: 'Solo se permiten letras' }
                })}
                type="text"
                onBlur={(e) => { const v = e.target.value.trim().toUpperCase(); setValue('primerNombre', v); }}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition text-sm"
                placeholder=""
                aria-invalid={errors.primerNombre ? 'true' : 'false'}
              />
              {errors.primerNombre && (
                <p className="text-red-500 text-xs mt-1">{String(errors.primerNombre.message)}</p>
              )}
            </div>

            {/* Nombre 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre 2
              </label>
              <input
                {...register('segundoNombre', {
                  validate: (v) => !v || ((v.length <= 20) && /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(v)) || 'Solo letras y máximo 20 caracteres'
                })}
                type="text"
                onBlur={(e) => { const v = e.target.value.trim().toUpperCase(); setValue('segundoNombre', v); }}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition text-sm"
                placeholder=""
              />
              {errors.segundoNombre && (
                <p className="text-red-500 text-xs mt-1">{String(errors.segundoNombre.message)}</p>
              )}
            </div>
          </div>

          {/* Apellido 1 y Apellidos 2 en la misma fila */}
          <div className="grid grid-cols-2 gap-3">
            {/* Apellido 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido 1 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('primerApellido', {
                  required: 'El primer apellido es obligatorio',
                  validate: (v) => (v && v.length <= 20) || 'Máximo 20 caracteres',
                  pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: 'Solo se permiten letras' }
                })}
                type="text"
                onBlur={(e) => { const v = e.target.value.trim().toUpperCase(); setValue('primerApellido', v); }}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition text-sm"
                placeholder=""
                aria-invalid={errors.primerApellido ? 'true' : 'false'}
              />
              {errors.primerApellido && (
                <p className="text-red-500 text-xs mt-1">{String(errors.primerApellido.message)}</p>
              )}
            </div>

            {/* Apellidos 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellidos 2
              </label>
              <input
                {...register('segundoApellido', {
                  validate: (v) => !v || ((v.length <= 20) && /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(v)) || 'Solo letras y máximo 20 caracteres'
                })}
                type="text"
                onBlur={(e) => { const v = e.target.value.trim().toUpperCase(); setValue('segundoApellido', v); }}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition text-sm"
                placeholder=""
              />
              {errors.segundoApellido && (
                <p className="text-red-500 text-xs mt-1">{String(errors.segundoApellido.message)}</p>
              )}
            </div>
          </div>

          {/* Estado y Seguimiento en grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                {...register('idEstado', { valueAsNumber: true, validate: (v) => v !== 0 || 'Seleccione un estado' })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition text-sm"
                aria-invalid={errors.idEstado ? 'true' : 'false'}
              >
                <option value={0}>Seleccione un estado</option>
                {estados.map(est => (
                  <option key={est.id} value={est.id}>
                    {est.nombre}
                  </option>
                ))}
              </select>
              {errors.idEstado && (
                <p className="text-red-500 text-xs mt-1">{String(errors.idEstado.message)}</p>
              )}
            </div>

            {/* Seguimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seguimiento <span className="text-red-500">*</span>
              </label>
              <select
                {...register('idSeguimiento', { valueAsNumber: true, validate: (v) => v !== 0 || 'Seleccione un seguimiento' })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition text-sm"
                aria-invalid={errors.idSeguimiento ? 'true' : 'false'}
              >
                <option value={0}>Seleccione un seguimiento</option>
                {seguimientos.map(seg => (
                  <option key={seg.id} value={seg.id}>
                    {seg.nombre}
                  </option>
                ))}
              </select>
              {errors.idSeguimiento && (
                <p className="text-red-500 text-xs mt-1">{String(errors.idSeguimiento.message)}</p>
              )}
            </div>
          </div>

          {/* Servicios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Servicios
            </label>
            <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto shadow-sm">
              {servicios.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay servicios disponibles</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {servicios.map(serv => (
                    <label key={serv.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedServicios.includes(serv.id)}
                        onChange={() => toggleServicio(serv.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{serv.nombre}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {selectedServicios.length > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                {selectedServicios.length} servicio(s) seleccionado(s)
              </p>
            )}
          </div>

          {/* Observación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observación
            </label>
            <textarea
              {...register('observacion')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition text-sm"
              rows={3}
              placeholder="Observaciones adicionales..."
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-1.5 rounded-lg text-white transition shadow cursor-pointer text-sm"
              style={{ backgroundColor: '#e63946' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded-lg text-white font-medium transition shadow cursor-pointer text-sm"
              style={{ backgroundColor: '#1938bc' }}
            >
              Guardar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
