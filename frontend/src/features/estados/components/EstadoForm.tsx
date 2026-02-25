import { useForm } from 'react-hook-form';
import type { EstadoAtencion, EstadoCreate } from '../types';
import { FiCheckSquare } from 'react-icons/fi';
import { MdError } from 'react-icons/md';

type EstadoFormProps = {
  onCancel: () => void;
  onSave?: (data: EstadoCreate) => Promise<void>;
  initial?: Partial<EstadoAtencion> | null;
  isEdit?: boolean;
};

export default function EstadoForm({ onCancel, onSave, initial, isEdit = false }: EstadoFormProps) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<any>({
    defaultValues: {
      nombre: initial?.nombre || '',
      descripcion: initial?.descripcion || ''
    }
  });

  const submit = handleSubmit(async (values) => {
    const nombre = values.nombre?.trim();
    const descripcion = values.descripcion?.trim() || undefined;
    if (onSave) await onSave({ nombre, descripcion });
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all">
        {/* Header */}
        <div className="px-6 py-5 rounded-t-2xl flex-shrink-0" style={{ backgroundColor: '#1a338e' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEdit ? 'Editar Estado' : 'Nuevo Estado'}
              </h2>
              <p className="text-white text-sm">
                {isEdit ? 'Actualice los datos del estado' : 'Registre un nuevo estado'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={submit} className="p-6">
          <div className="space-y-6">
            {/* Sección: Información del Estado */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiCheckSquare className="text-blue-600" />
                Información del Estado
              </h3>
              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('nombre', {
                      required: 'El nombre es obligatorio',
                      minLength: { value: 2, message: 'Mínimo 2 caracteres' },
                      maxLength: { value: 100, message: 'Máximo 100 caracteres' }
                    })}
                    onBlur={(e) => setValue('nombre', e.target.value.trim())}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {errors.nombre && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <MdError size={16} />
                      <p className="text-xs">{String(errors.nombre.message)}</p>
                    </div>
                  )}
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción (opcional)
                  </label>
                  <textarea
                    {...register('descripcion')}
                    onBlur={(e) => setValue('descripcion', e.target.value.trim())}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-red-400 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-lg" style={{ backgroundColor: '#1a338e' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#152156')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1a338e')}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
