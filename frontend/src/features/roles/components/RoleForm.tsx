import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { MdError } from 'react-icons/md';
import { FiShield } from 'react-icons/fi';

interface RoleFormProps {
  onCancel: () => void;
  onSave: (data: { id?: number; nombre: string; descripcion?: string }) => void;
  initial?: { id?: number; nombre?: string; descripcion?: string } | null;
  isEdit?: boolean;
}

export default function RoleForm({ onCancel, onSave, initial = null, isEdit = false }: RoleFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>();

  useEffect(() => {
    if (!initial) {
      reset({ nombre: '', descripcion: '' });
      return;
    }
    reset({ nombre: initial.nombre ?? '', descripcion: initial.descripcion ?? '' });
  }, [initial, reset]);

  const onSubmit = (data: any) => {
    const payload = {
      id: initial?.id,
      nombre: String(data.nombre ?? '').trim(),
      descripcion: String(data.descripcion ?? '').trim(),
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 transform transition-all">
        {/* Header */}
        <div className="px-6 py-5 rounded-t-2xl" style={{ backgroundColor: '#1a338e' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEdit ? 'Editar Rol' : 'Nuevo Rol'}
              </h2>
              <p className="text-blue-200 text-sm">
                {isEdit ? 'Actualice los datos del rol' : 'Registre un nuevo rol'}
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
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-5">
            {/* Sección: Información del Rol */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiShield className="text-blue-600" />
                Información del Rol
              </h3>

              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...(isEdit
                      ? register('nombre')
                      : register('nombre', { required: 'Nombre es obligatorio', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })
                    )}
                    readOnly={isEdit}
                    placeholder="Nombre del rol"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.nombre ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                    } ${isEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  />
                  {errors.nombre && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <MdError size={16} />
                      <p className="text-xs">{String((errors.nombre as any).message)}</p>
                    </div>
                  )}
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    {...register('descripcion', { maxLength: { value: 255, message: 'Máximo 255 caracteres' } })}
                    placeholder="Descripción del rol (opcional)"
                    rows={3}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                      errors.descripcion ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                  />
                  {errors.descripcion && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <MdError size={16} />
                      <p className="text-xs">{String((errors.descripcion as any).message)}</p>
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
              className="flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              style={{ backgroundColor: '#1a338e' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#152156')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1a338e')}
            >
              {isEdit ? 'Guardar cambios' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
