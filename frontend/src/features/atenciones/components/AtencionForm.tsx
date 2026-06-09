import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { NewAtencionConPaciente, UpdateAtencion, Atencion, TipoDocumento, Empresa, EstadoAtencion, SeguimientoAtencion, ServicioOption } from '../types';
import { getEmpresas, getEstadosAtencion, getSeguimientosAtencion, getServicios, getTiposDocumento } from '../Atencion.api';
import { getPacienteById } from '../../pacientes/Paciente.api';
import { MdCheckCircle } from 'react-icons/md';
import { FiUser, FiMail, FiPhone, FiCalendar, FiFileText, FiCheckSquare, FiList, FiActivity, FiSearch, FiChevronDown } from 'react-icons/fi';
import { logger } from '../../../utils/logger';
import { FormModal, SectionCard, FieldGroup, FormInput, FormTextarea, ModalFooter } from '../../../components/animate-ui/form-modal';

// ── SearchableSelect ─────────────────────────────────────────────────────────
interface SearchableSelectOption { value: number; label: string; }
interface SearchableSelectProps {
  value: number;
  onChange: (value: number) => void;
  options: SearchableSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
}

function SearchableSelect({ value, onChange, options, placeholder = 'Seleccione...', disabled = false, hasError = false }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find(o => o.value === value);
  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchRef.current) searchRef.current.focus();
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(o => !o)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-all outline-none text-left
          ${hasError ? 'border-red-300 bg-red-50/40' : 'border-gray-200'}
          ${isOpen ? 'ring-2 ring-blue-100 border-blue-400' : ''}
          ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:border-blue-300'}
        `}
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <FiChevronDown size={14} style={{ color: 'var(--brand-400)' }} />
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-xl border border-gray-200 overflow-hidden"
            style={{ boxShadow: '0 8px 24px rgba(13,31,107,0.14), 0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={13} />
                <input
                  ref={searchRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar empresa..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400 text-center">Sin resultados</div>
              ) : (
                filtered.map(opt => (
                  <motion.button
                    key={opt.value}
                    type="button"
                    whileHover={{ backgroundColor: 'var(--brand-50)' }}
                    onClick={() => { onChange(opt.value); setIsOpen(false); setSearch(''); }}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer"
                    style={opt.value === value ? { background: 'var(--brand-100)', color: 'var(--brand-700)', fontWeight: 600 } : { color: '#374151' }}
                  >
                    {opt.label}
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── StyledSelect (dropdown estilizado sin búsqueda) ─────────────────────────
interface StyledSelectOption { value: number; label: string; }
interface StyledSelectProps {
  value: number;
  onChange: (value: number) => void;
  options: StyledSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
}

function StyledSelect({ value, onChange, options, placeholder = 'Seleccione...', disabled = false, hasError = false }: StyledSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(o => !o)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 bg-white border rounded-lg text-sm transition-all outline-none text-left
          ${hasError ? 'border-red-300 bg-red-50/40' : 'border-gray-200'}
          ${isOpen ? 'ring-2 ring-blue-100 border-blue-400' : ''}
          ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:border-blue-300'}
        `}
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <FiChevronDown size={14} style={{ color: 'var(--brand-400)' }} />
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-xl border border-gray-200 overflow-hidden"
            style={{ boxShadow: '0 8px 24px rgba(13,31,107,0.14), 0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <div className="max-h-52 overflow-y-auto">
              {options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer hover:bg-[#f4f6ff]"
                  style={opt.value === value
                    ? { background: 'var(--brand-100)', color: 'var(--brand-700)', fontWeight: 600 }
                    : { color: '#374151' }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── AnimatedCheckbox ─────────────────────────────────────────────────────────
interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
}

function AnimatedCheckbox({ checked, onChange, disabled = false, label }: AnimatedCheckboxProps) {
  return (
    <div
      className={`flex items-center gap-2.5 p-2 rounded-lg select-none transition-colors duration-150
        ${disabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer hover:bg-[#f4f6ff]'}`}
      onClick={() => !disabled && onChange()}
    >
      <motion.div
        className="relative flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center"
        initial={false}
        animate={{
          borderColor: checked ? '#2e5fd4' : '#d1d5db',
          backgroundColor: checked ? '#2e5fd4' : '#ffffff',
        }}
        style={{ border: '2px solid' }}
        transition={{ duration: 0.18 }}
        whileTap={!disabled ? { scale: 0.82 } : {}}
      >
        <AnimatePresence>
          {checked && (
            <motion.svg
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              width="11" height="11" viewBox="0 0 12 12" fill="none"
            >
              <polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>
      <span
        className="text-sm leading-tight transition-colors duration-150"
        style={{ color: checked ? '#1a338e' : '#374151' }}
      >
        {label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
type AtencionFormProps = {
  onCancel: () => void;
  onSave: (data: NewAtencionConPaciente) => Promise<void>;
  onUpdate?: (id: string, data: UpdateAtencion) => Promise<void>;
  initialData?: Atencion;
  isEditMode?: boolean;
  userId?: number;
  isOpen: boolean;
};

export default function AtencionForm({ onCancel, onSave, onUpdate, initialData, isEditMode = false, userId, isOpen }: AtencionFormProps) {
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

  const { register, handleSubmit: rhfHandleSubmit, setValue, reset, watch, control, formState: { errors } } = useForm<FormValues>({
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

  // Reiniciar formulario cuando se abre en modo edición con nuevos datos
  useEffect(() => {
    if (isOpen && isEditMode && initialData) {
      reset({
        idTipoDocumento: 0,
        idPaciente: initialData.id_paciente || '',
        email: initialData.email || '',
        telefonoUno: initialData.telefono_uno || '',
        telefonoDos: initialData.telefono_dos || '',
        primerNombre: '',
        segundoNombre: '',
        primerApellido: '',
        segundoApellido: '',
        idAtencion: initialData.id_atencion?.replace('T', '') || '',
        fechaIngreso: initialData.fecha_atencion ? initialData.fecha_atencion.split('T')[0] : '',
        idEmpresa: initialData.id_empresa || 0,
        idEstado: initialData.id_estado_atencion || 0,
        idSeguimiento: initialData.id_seguimiento_atencion || 0,
        observacion: initialData.observacion || ''
      });
      setSelectedServicios(initialData.servicios?.map(s => s.id_servicio) || []);
    }
  }, [isOpen, isEditMode, initialData?.id_atencion]);

  // Cargar catálogos y paciente en paralelo (optimizado)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        logger.log('Iniciando carga de datos...');
        
        // Crear array de promesas
        const promises: Promise<any>[] = [
          getTiposDocumento(),
          getEmpresas(),
          getEstadosAtencion(),
          getSeguimientosAtencion(),
          getServicios()
        ];

        // Agregar paciente si es modo edición
        if (isEditMode && initialData?.id_paciente) {
          promises.push(getPacienteById(initialData.id_paciente));
        }

        // Ejecutar todas las promesas en paralelo
        const results = await Promise.all(promises);
        
        // Destructurar resultados
        const [tipos, emp, est, seg, serv, paciente] = results;
        
        logger.log('Datos cargados:', { tipos, emp, est, seg, serv });
        
        // Actualizar catálogos
        setTiposDocumento(tipos);
        setEmpresas(emp);
        setEstados(est);
        setSeguimientos(seg);
        setServicios(serv);
        
        // Si hay paciente, sincronizar datos
        if (paciente) {
          logger.log('Paciente cargado:', paciente);
          setValue('idTipoDocumento', paciente.id_tipo_documento);
          setValue('idPaciente', paciente.id);
          setValue('primerNombre', paciente.primer_nombre);
          setValue('segundoNombre', paciente.segundo_nombre || '');
          setValue('primerApellido', paciente.primer_apellido);
          setValue('segundoApellido', paciente.segundo_apellido || '');
          setValue('telefonoUno', paciente.telefono_uno || '');
          setValue('telefonoDos', paciente.telefono_dos || '');
          setValue('email', paciente.email || '');
        }
      } catch (err) {
        logger.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
    <FormModal
      isOpen={isOpen}
      onClose={onCancel}
      title={isEditMode ? 'Editar Atención' : 'Nueva Atención'}
      subtitle={isEditMode ? 'Actualice los datos de la atención' : 'Registre una nueva atención con paciente'}
      icon={<FiActivity size={20} />}
      maxWidth="max-w-3xl"
      scrollable
    >
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
        <form onSubmit={onSubmit} id="atencion-form" className="space-y-4">
          {/* Sección: Datos de la Atención */}
          <SectionCard index={0} icon={<FiFileText />} title="Datos de la Atención">
            <div className="grid grid-cols-2 gap-4">
              {/* ID Atención */}
              <FieldGroup label="Id Atención" required error={errors.idAtencion?.message}>
                <div className="flex items-center gap-2">
                  {!isEditMode && (
                    <span
                      className="px-3 py-2.5 rounded-lg text-sm font-bold flex-shrink-0"
                      style={{ background: 'var(--brand-100)', border: '1px solid var(--brand-200)', color: 'var(--brand-700)' }}
                    >
                      T
                    </span>
                  )}
                  <FormInput
                    {...register('idAtencion', !isEditMode ? {
                      required: 'El ID de la atención es obligatorio',
                      pattern: { value: /^\d+$/, message: 'El ID debe contener solo números' },
                      maxLength: { value: 10, message: 'El ID no debe superar 10 dígitos' }
                    } : {})}
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 12345"
                    disabled={isEditMode}
                    hasError={!!errors.idAtencion}
                    icon={<FiFileText size={14} />}
                  />
                </div>
              </FieldGroup>

              {/* Fecha Atención */}
              <FieldGroup label="Fecha Atención" required error={errors.fechaIngreso?.message}>
                <div className="relative">
                  <Controller
                    name="fechaIngreso"
                    control={control}
                    rules={{ required: 'La fecha de atención es obligatoria' }}
                    render={({ field }) => (
                      <DatePicker
                        selected={field.value ? new Date(field.value + 'T00:00:00') : null}
                        onChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Seleccione una fecha"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        className={`w-full px-4 py-2.5 pl-10 border rounded-lg text-sm transition-all outline-none cursor-pointer hover:border-blue-300 focus:ring-2 focus:ring-offset-0 bg-white ${errors.fechaIngreso ? 'border-red-300 bg-red-50/40 focus:ring-red-200 focus:border-red-400' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-400'}`}
                        popperClassName="atf-datepicker-popper"
                        calendarClassName="shadow-xl"
                        wrapperClassName="w-full"
                      />
                    )}
                  />
                  <FiCalendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'var(--brand-400)' }}
                    size={16}
                  />
                </div>
              </FieldGroup>

              {/* Empresa */}
              <div className="col-span-2">
                <FieldGroup label="Empresa" required error={errors.idEmpresa?.message}>
                  <Controller
                    name="idEmpresa"
                    control={control}
                    rules={{ validate: v => (v !== undefined && v !== 0) || 'Debe seleccionar una empresa' }}
                    render={({ field }) => (
                      <SearchableSelect
                        value={field.value ?? 0}
                        onChange={(val) => field.onChange(val)}
                        options={empresas.map(e => ({ value: e.id, label: e.nombre }))}
                        placeholder="-- Seleccione Empresa --"
                        disabled={!canEditFields}
                        hasError={!!errors.idEmpresa}
                      />
                    )}
                  />
                </FieldGroup>
              </div>
            </div>
          </SectionCard>

          {/* Sección: Datos del Paciente */}
          <SectionCard index={1} icon={<FiUser />} title="Datos del Paciente">
            <div className="grid grid-cols-2 gap-4">
              {/* Tipo de Documento */}
              <FieldGroup label="Tipo de Documento" required error={errors.idTipoDocumento?.message}>
                <Controller
                  name="idTipoDocumento"
                  control={control}
                  rules={{ validate: (v) => v !== 0 || 'Seleccione un tipo de documento' }}
                  render={({ field }) => (
                    <StyledSelect
                      value={field.value ?? 0}
                      onChange={field.onChange}
                      options={tiposDocumento.map(t => ({ value: t.id, label: t.descripcion }))}
                      placeholder="-- Seleccione Tipo --"
                      hasError={!!errors.idTipoDocumento}
                    />
                  )}
                />
              </FieldGroup>

              {/* Número de Documento */}
              <FieldGroup label="Número de Documento" required error={errors.idPaciente?.message}>
                <FormInput
                  {...register('idPaciente', { required: 'El número de documento es obligatorio' })}
                  type="text"
                  onBlur={(e) => { const v = e.target.value.trim(); setValue('idPaciente', v); }}
                  placeholder="Ej: 1234567890"
                  hasError={!!errors.idPaciente}
                  icon={<FiFileText size={14} />}
                />
              </FieldGroup>

              {/* Email */}
              <div className="col-span-2">
                <FieldGroup label="Email" required error={errors.email?.message}>
                  <FormInput
                    {...register('email', { required: 'El email es obligatorio', pattern: { value: /^\S+@\S+\.\S+$/, message: 'El email no tiene un formato válido' } })}
                    type="email"
                    onBlur={(e) => { const v = e.target.value.trim().toLowerCase(); setValue('email', v); }}
                    placeholder="ejemplo@correo.com"
                    hasError={!!errors.email}
                    icon={<FiMail size={14} />}
                  />
                </FieldGroup>
              </div>

              {/* Teléfono 1 */}
              <FieldGroup label="Teléfono 1" required error={errors.telefonoUno?.message}>
                <FormInput
                  {...register('telefonoUno', {
                    required: 'El teléfono 1 es obligatorio',
                    pattern: { value: /^\d{7,10}$/, message: 'El teléfono debe contener solo números (7-10 dígitos)' }
                  })}
                  type="tel"
                  inputMode="numeric"
                  onBlur={(e) => { const v = e.target.value.trim(); setValue('telefonoUno', v); }}
                  placeholder="Teléfono principal (obligatorio)"
                  hasError={!!errors.telefonoUno}
                  icon={<FiPhone size={14} />}
                />
              </FieldGroup>

              {/* Teléfono 2 */}
              <FieldGroup label="Teléfono 2" error={errors.telefonoDos?.message}>
                <FormInput
                  {...register('telefonoDos', {
                    validate: (v) => !v || /^\d{7,10}$/.test(v) || 'El teléfono debe contener solo números (7-10 dígitos)'
                  })}
                  type="tel"
                  inputMode="numeric"
                  onBlur={(e) => { const v = e.target.value.trim(); setValue('telefonoDos', v); }}
                  placeholder="Teléfono alternativo (opcional)"
                  hasError={!!errors.telefonoDos}
                  icon={<FiPhone size={14} />}
                />
              </FieldGroup>

              {/* Nombre 1 */}
              <FieldGroup label="Nombre 1" required error={errors.primerNombre?.message}>
                <FormInput
                  {...register('primerNombre', {
                    required: 'El primer nombre es obligatorio',
                    validate: (v) => (v && v.length <= 20) || 'Máximo 20 caracteres',
                    pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: 'Solo se permiten letras' }
                  })}
                  type="text"
                  onBlur={(e) => { const v = e.target.value.trim().toUpperCase(); setValue('primerNombre', v); }}
                  placeholder="Primer nombre (obligatorio)"
                  hasError={!!errors.primerNombre}
                  icon={<FiUser size={14} />}
                />
              </FieldGroup>

              {/* Nombre 2 */}
              <FieldGroup label="Nombre 2" error={errors.segundoNombre?.message}>
                <FormInput
                  {...register('segundoNombre', {
                    validate: (v) => !v || ((v.length <= 20) && /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(v)) || 'Solo letras y máximo 20 caracteres'
                  })}
                  type="text"
                  onBlur={(e) => { const v = e.target.value.trim().toUpperCase(); setValue('segundoNombre', v); }}
                  placeholder="Segundo nombre (opcional)"
                  hasError={!!errors.segundoNombre}
                  icon={<FiUser size={14} />}
                />
              </FieldGroup>

              {/* Apellido 1 */}
              <FieldGroup label="Apellido 1" required error={errors.primerApellido?.message}>
                <FormInput
                  {...register('primerApellido', {
                    required: 'El primer apellido es obligatorio',
                    validate: (v) => (v && v.length <= 20) || 'Máximo 20 caracteres',
                    pattern: { value: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, message: 'Solo se permiten letras' }
                  })}
                  type="text"
                  onBlur={(e) => { const v = e.target.value.trim().toUpperCase(); setValue('primerApellido', v); }}
                  placeholder="Primer apellido (obligatorio)"
                  hasError={!!errors.primerApellido}
                  icon={<FiUser size={14} />}
                />
              </FieldGroup>

              {/* Apellido 2 */}
              <FieldGroup label="Apellido 2" error={errors.segundoApellido?.message}>
                <FormInput
                  {...register('segundoApellido', {
                    validate: (v) => !v || ((v.length <= 20) && /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(v)) || 'Solo letras y máximo 20 caracteres'
                  })}
                  type="text"
                  onBlur={(e) => { const v = e.target.value.trim().toUpperCase(); setValue('segundoApellido', v); }}
                  placeholder="Segundo apellido (opcional)"
                  hasError={!!errors.segundoApellido}
                  icon={<FiUser size={14} />}
                />
              </FieldGroup>
            </div>
          </SectionCard>

          {/* Sección: Estado y Seguimiento */}
          <SectionCard index={2} icon={<FiCheckSquare />} title="Estado y Seguimiento">
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Estado" required error={errors.idEstado?.message}>
                <Controller
                  name="idEstado"
                  control={control}
                  rules={{ validate: (v) => v !== 0 || 'Seleccione un estado' }}
                  render={({ field }) => (
                    <StyledSelect
                      value={field.value ?? 0}
                      onChange={field.onChange}
                      options={estados.map(e => ({ value: e.id, label: e.nombre }))}
                      placeholder="-- Seleccione Estado --"
                      disabled={!canEditFields}
                      hasError={!!errors.idEstado}
                    />
                  )}
                />
              </FieldGroup>

              <FieldGroup label="Seguimiento" required error={errors.idSeguimiento?.message}>
                <Controller
                  name="idSeguimiento"
                  control={control}
                  rules={{ validate: (v) => v !== 0 || 'Seleccione un seguimiento' }}
                  render={({ field }) => (
                    <StyledSelect
                      value={field.value ?? 0}
                      onChange={field.onChange}
                      options={seguimientos.map(s => ({ value: s.id, label: s.nombre }))}
                      placeholder="-- Seleccione Seguimiento --"
                      disabled={!canEditFields}
                      hasError={!!errors.idSeguimiento}
                    />
                  )}
                />
              </FieldGroup>
            </div>
          </SectionCard>

          {/* Sección: Servicios */}
          <SectionCard index={3} icon={<FiList />} title="Servicios">
            <div
              className="rounded-xl p-4 max-h-52 overflow-y-auto"
              style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)' }}
            >
              {servicios.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>No hay servicios disponibles</p>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {servicios.map(serv => (
                    <AnimatedCheckbox
                      key={serv.id}
                      checked={selectedServicios.includes(serv.id)}
                      onChange={() => toggleServicio(serv.id)}
                      disabled={!canEditFields}
                      label={serv.nombre}
                    />
                  ))}
                </div>
              )}
            </div>
            <AnimatePresence>
              {selectedServicios.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg"
                  style={{ background: 'var(--brand-100)', color: 'var(--brand-700)' }}
                >
                  <MdCheckCircle size={18} />
                  <p className="text-xs font-semibold">
                    {selectedServicios.length} servicio(s) seleccionado(s)
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </SectionCard>

          {/* Sección: Observación */}
          <SectionCard index={4} title="Observación">
            <FormTextarea
              {...register('observacion')}
              rows={4}
              placeholder="Escriba observaciones adicionales aquí..."
              maxLength={255}
            />
            <p className="text-xs mt-1 text-right font-medium" style={{ color: 'var(--text-muted)' }}>
              {observacion.length}/255 caracteres
            </p>
          </SectionCard>

          <ModalFooter
            onCancel={onCancel}
            isLoading={loading}
            submitLabel={isEditMode ? 'Actualizar' : 'Guardar'}
            formId="atencion-form"
          />
        </form>
      )}
    </FormModal>
  );
}
