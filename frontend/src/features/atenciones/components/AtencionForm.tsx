import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useForm } from 'react-hook-form';
import type { NewAtencionConPaciente, UpdateAtencion, Atencion, TipoDocumento, Empresa, EstadoAtencion, SeguimientoAtencion, ServicioOption } from '../types';
import { getEmpresas, getEstadosAtencion, getSeguimientosAtencion, getServicios, getTiposDocumento } from '../Atencion.api';
import { getPacienteById } from '../../pacientes/Paciente.api';
import { MdError, MdCheckCircle } from 'react-icons/md';
import { FiUser, FiMail, FiPhone, FiCalendar, FiFileText, FiCheckSquare, FiList } from 'react-icons/fi';

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

  const { auth } = useAuth();
  const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
  // Allow some flexibility in role naming (e.g. prefixes/suffixes). Use includes to be permissive.
  const canEditFields = ['ADMINISTRADOR', 'ASESOR', 'FACTURADOR'].some(r => role.includes(r));

  // Diagnostic log to help debug visibility for ASESOR/FACTURADOR
  // debug log removed

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

  const { register, handleSubmit: rhfHandleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    mode: 'onChange',
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

  const observacion = watch('observacion') || '';

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
    const telefonoDosNorm = values.telefonoDos?.trim() ?? '';

    if (isEditMode) {
        const updateData: UpdateAtencion = {
        id_usuario: userId,
        observacion: values.observacion?.trim() || undefined,
        servicios: selectedServicios,
        id_paciente: idPacienteNorm || undefined,
        id_tipo_documento: values.idTipoDocumento || undefined,
          telefono_uno: telefonoUnoNorm !== '' ? telefonoUnoNorm : null,
          telefono_dos: telefonoDosNorm !== '' ? telefonoDosNorm : null,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={!loading ? onCancel : undefined}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 transform transition-all max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-sky-700 px-6 py-5 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEditMode ? 'Editar Atención' : 'Nueva Atención'}
              </h2>
              <p className="text-white text-sm">
                {isEditMode ? 'Actualice los datos de la atención' : 'Registre una nueva atención con paciente'}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600">Cargando datos...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Body */}
            <div className="overflow-y-auto flex-1 p-6">
              <form onSubmit={onSubmit} className="space-y-6" id="atencion-form">
                {/* Sección: Datos de la Atención */}
                <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg p-4 border border-sky-200">
                  <h3 className="text-sm font-bold text-sky-900 mb-4 flex items-center gap-2">
                    <FiFileText className="text-sky-600" />
                    Datos de la Atención
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* ID Atención */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Id Atención <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {!isEditMode && (
                          <span className="px-3 py-2.5 bg-blue-100 border border-blue-300 rounded-lg text-blue-700 font-bold text-sm">T</span>
                        )}
                        <div className="relative flex-1">
                          <input
                            {...register('idAtencion', !isEditMode ? {
                              required: 'El ID de la atención es obligatorio',
                              pattern: { value: /^\d+$/, message: 'El ID debe contener solo números' },
                              maxLength: { value: 10, message: 'El ID no debe superar 10 dígitos' }
                            } : {})}
                            type="text"
                            inputMode="numeric"
                            className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="Ej: 12345"
                            disabled={isEditMode}
                            aria-invalid={errors.idAtencion ? 'true' : 'false'}
                          />
                          <FiFileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                      </div>
                      {errors.idAtencion && (
                        <div className="flex items-center gap-1 mt-2 text-red-600">
                          <MdError size={16} />
                          <p className="text-xs">{String(errors.idAtencion.message)}</p>
                        </div>
                      )}
                    </div>

                    {/* Fecha Atención */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Fecha Atención <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          {...register('fechaIngreso', { required: 'La fecha de atención es obligatoria' })}
                          type="date"
                          className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          aria-invalid={errors.fechaIngreso ? 'true' : 'false'}
                        />
                        <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      </div>
                      {errors.fechaIngreso && (
                        <div className="flex items-center gap-1 mt-2 text-red-600">
                          <MdError size={16} />
                          <p className="text-xs">{String(errors.fechaIngreso.message)}</p>
                        </div>
                      )}
                    </div>

                    {/* Empresa */}
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Empresa <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('idEmpresa', { required: 'La empresa es obligatoria', validate: v => v !== 0 || 'Debe seleccionar una empresa' })}
                        disabled={!canEditFields}
                        className={`w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!canEditFields ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        aria-invalid={errors.idEmpresa ? 'true' : 'false'}
                      >
                        <option value={0}>-- Seleccione Empresa --</option>
                        {empresas.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.nombre}
                          </option>
                        ))}
                      </select>
                      {errors.idEmpresa && (
                        <div className="flex items-center gap-1 mt-2 text-red-600">
                          <MdError size={16} />
                          <p className="text-xs">{String(errors.idEmpresa.message)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sección: Datos del Paciente */}
                <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg p-4 border border-sky-200">
                  <h3 className="text-sm font-bold text-sky-900 mb-4 flex items-center gap-2">
                    <FiUser className="text-sky-600" />
                    Datos del Paciente
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Tipo de Documento */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tipo de Documento <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('idTipoDocumento', { valueAsNumber: true, validate: (v) => v !== 0 || 'Seleccione un tipo de documento' })}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        aria-invalid={errors.idTipoDocumento ? 'true' : 'false'}
                      >
                        <option value={0}>-- Seleccione Tipo --</option>
                        {tiposDocumento.map(tipo => (
                          <option key={tipo.id} value={tipo.id}>
                            {tipo.descripcion}
                          </option>
                        ))}
                      </select>
                      {errors.idTipoDocumento && (
                        <div className="flex items-center gap-1 mt-2 text-red-600">
                          <MdError size={16} />
                          <p className="text-xs">{String(errors.idTipoDocumento.message)}</p>
                        </div>
                      )}
                    </div>

                    {/* Número de Documento */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Número de Documento <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          {...register('idPaciente', { required: 'El número de documento es obligatorio' })}
                          type="text"
                          onBlur={(e) => { const v = e.target.value.trim(); setValue('idPaciente', v); }}
                          className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Ej: 1234567890"
                          aria-invalid={errors.idPaciente ? 'true' : 'false'}
                        />
                        <FiFileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      </div>
                      {errors.idPaciente && (
                        <div className="flex items-center gap-1 mt-2 text-red-600">
                          <MdError size={16} />
                          <p className="text-xs">{String(errors.idPaciente.message)}</p>
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          {...register('email', { required: 'El email es obligatorio', pattern: { value: /^\S+@\S+\.\S+$/, message: 'El email no tiene un formato válido' } })}
                          type="email"
                          onBlur={(e) => { const v = e.target.value.trim().toLowerCase(); setValue('email', v); }}
                          className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="ejemplo@correo.com"
                          aria-invalid={errors.email ? 'true' : 'false'}
                        />
                        <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      </div>
                      {errors.email && (
                        <div className="flex items-center gap-1 mt-2 text-red-600">
                          <MdError size={16} />
                          <p className="text-xs">{String(errors.email.message)}</p>
                        </div>
                      )}
                    </div>

                    {/* Teléfono 1 */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Teléfono 1 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          {...register('telefonoUno', {
                            required: 'El teléfono 1 es obligatorio',
                            pattern: { value: /^\d{7,10}$/, message: 'El teléfono debe contener solo números (7-10 dígitos)' }
                          })}
                          type="tel"
                          inputMode="numeric"
                          onBlur={(e) => { const v = e.target.value.trim(); setValue('telefonoUno', v); }}
                          className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="3001234567"
                          aria-invalid={errors.telefonoUno ? 'true' : 'false'}
                        />
                        <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      </div>
                      {errors.telefonoUno && (
                        <div className="flex items-center gap-1 mt-2 text-red-600">
                          <MdError size={16} />
                          <p className="text-xs">{String(errors.telefonoUno.message)}</p>
                        </div>
                      )}
                    </div>

                    {/* Teléfono 2 */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Teléfono 2
                      </label>
                      <div className="relative">
                        <input
                          {...register('telefonoDos', {
                            validate: (v) => !v || /^\d{7,10}$/.test(v) || 'El teléfono debe contener solo números (7-10 dígitos)'
                          })}
                          type="tel"
                          inputMode="numeric"
                          onBlur={(e) => { const v = e.target.value.trim(); setValue('telefonoDos', v); }}
                          className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="3001234567"
                        />
                        <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      </div>
                      {errors.telefonoDos && (
                        <div className="flex items-center gap-1 mt-2 text-red-600">
                          <MdError size={16} />
                          <p className="text-xs">{String(errors.telefonoDos.message)}</p>
                        </div>
                      )}
                    </div>

                    {/* Nombre 1 */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre 1 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          {...register('primerNombre', {
                            required: 'El primer nombre es obligatorio',
                            validate: (v) => (v && v.length <= 20) || 'Máximo 20 caracteres',
                            pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: 'Solo se permiten letras' }
                          })}
                          type="text"
                          onBlur={(e) => { const v = e.target.value.trim().toUpperCase(); setValue('primerNombre', v); }}
                          className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="JUAN"
                          aria-invalid={errors.primerNombre ? 'true' : 'false'}
                        />
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      </div>
                      {errors.primerNombre && (
                        <div className="flex items-center gap-1 mt-2 text-red-600">
                          <MdError size={16} />
                          <p className="text-xs">{String(errors.primerNombre.message)}</p>
                        </div>
                      )}
                    </div>

                    {/* Nombre 2 */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre 2
                      </label>
                      <div className="relative">
                        <input
                          {...register('segundoNombre', {
                            validate: (v) => !v || ((v.length <= 20) && /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(v)) || 'Solo letras y máximo 20 caracteres'
                          })}
                          type="text"
                          onBlur={(e) => { const v = e.target.value.trim().toUpperCase(); setValue('segundoNombre', v); }}
                          className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="CARLOS"
                        />
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      </div>
                      {errors.segundoNombre && (
                        <div className="flex items-center gap-1 mt-2 text-red-600">
                          <MdError size={16} />
                          <p className="text-xs">{String(errors.segundoNombre.message)}</p>
                        </div>
                      )}
                    </div>

                    {/* Apellido 1 */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Apellido 1 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          {...register('primerApellido', {
                            required: 'El primer apellido es obligatorio',
                            validate: (v) => (v && v.length <= 20) || 'Máximo 20 caracteres',
                            pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: 'Solo se permiten letras' }
                          })}
                          type="text"
                          onBlur={(e) => { const v = e.target.value.trim().toUpperCase(); setValue('primerApellido', v); }}
                          className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="PÉREZ"
                          aria-invalid={errors.primerApellido ? 'true' : 'false'}
                        />
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      </div>
                      {errors.primerApellido && (
                        <div className="flex items-center gap-1 mt-2 text-red-600">
                          <MdError size={16} />
                          <p className="text-xs">{String(errors.primerApellido.message)}</p>
                        </div>
                      )}
                    </div>

                    {/* Apellido 2 */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Apellido 2
                      </label>
                      <div className="relative">
                        <input
                          {...register('segundoApellido', {
                            validate: (v) => !v || ((v.length <= 20) && /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(v)) || 'Solo letras y máximo 20 caracteres'
                          })}
                          type="text"
                          onBlur={(e) => { const v = e.target.value.trim().toUpperCase(); setValue('segundoApellido', v); }}
                          className="w-full px-4 py-2.5 pl-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="GARCÍA"
                        />
                        <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      </div>
                      {errors.segundoApellido && (
                        <div className="flex items-center gap-1 mt-2 text-red-600">
                          <MdError size={16} />
                          <p className="text-xs">{String(errors.segundoApellido.message)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sección: Estado y Seguimiento */}
                <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg p-4 border border-sky-200">
                  <h3 className="text-sm font-bold text-sky-900 mb-4 flex items-center gap-2">
                    <FiCheckSquare className="text-sky-600" />
                    Estado y Seguimiento
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Estado */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Estado <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('idEstado', { valueAsNumber: true, validate: (v) => v !== 0 || 'Seleccione un estado' })}
                        disabled={!canEditFields}
                        className={`w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!canEditFields ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        aria-invalid={errors.idEstado ? 'true' : 'false'}
                      >
                        <option value={0}>-- Seleccione Estado --</option>
                        {estados.map(est => (
                          <option key={est.id} value={est.id}>
                            {est.nombre}
                          </option>
                        ))}
                      </select>
                      {errors.idEstado && (
                        <div className="flex items-center gap-1 mt-2 text-red-600">
                          <MdError size={16} />
                          <p className="text-xs">{String(errors.idEstado.message)}</p>
                        </div>
                      )}
                    </div>

                    {/* Seguimiento */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Seguimiento <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register('idSeguimiento', { valueAsNumber: true, validate: (v) => v !== 0 || 'Seleccione un seguimiento' })}
                        disabled={!canEditFields}
                        className={`w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${!canEditFields ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        aria-invalid={errors.idSeguimiento ? 'true' : 'false'}
                      >
                        <option value={0}>-- Seleccione Seguimiento --</option>
                        {seguimientos.map(seg => (
                          <option key={seg.id} value={seg.id}>
                            {seg.nombre}
                          </option>
                        ))}
                      </select>
                      {errors.idSeguimiento && (
                        <div className="flex items-center gap-1 mt-2 text-red-600">
                          <MdError size={16} />
                          <p className="text-xs">{String(errors.idSeguimiento.message)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sección: Servicios */}
                <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg p-4 border border-sky-200">
                  <h3 className="text-sm font-bold text-sky-900 mb-3 flex items-center gap-2">
                    <FiList className="text-sky-600" />
                    Servicios
                  </h3>
                  <div className="border border-sky-200 rounded-lg p-4 max-h-48 overflow-y-auto bg-white shadow-sm">
                    {servicios.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">No hay servicios disponibles</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {servicios.map(serv => (
                          <label key={serv.id} className={`flex items-center gap-2 ${!canEditFields ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-sky-50'} p-2 rounded transition-colors`}>
                            <input
                              type="checkbox"
                              checked={selectedServicios.includes(serv.id)}
                              onChange={() => toggleServicio(serv.id)}
                              disabled={!canEditFields}
                              className="w-4 h-4 text-sky-600 focus:ring-sky-500 rounded"
                            />
                            <span className="text-sm">{serv.nombre}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedServicios.length > 0 && (
                    <div className="flex items-center gap-2 mt-3 text-sky-700 bg-sky-100 px-3 py-2 rounded-lg">
                      <MdCheckCircle size={18} />
                      <p className="text-xs font-semibold">
                        {selectedServicios.length} servicio(s) seleccionado(s)
                      </p>
                    </div>
                  )}
                </div>

                {/* Sección: Observación */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Observación
                  </label>
                  <div className="relative">
                    <textarea
                      {...register('observacion')}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      rows={6}
                      placeholder="Escriba observaciones adicionales aquí..."
                      maxLength={255}
                    />
                    <p className="text-xs text-gray-500 mt-2 text-right font-medium">
                      {observacion.length}/255 caracteres
                    </p>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex-shrink-0">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-red-400 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="atencion-form"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
