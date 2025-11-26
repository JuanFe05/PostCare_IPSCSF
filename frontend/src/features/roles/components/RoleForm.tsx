import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

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
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-xl w-full max-w-[720px] border border-gray-200">
      <h3 className="text-2xl font-semibold mb-6 text-gray-800">{isEdit ? 'Editar rol' : 'Nuevo rol'}</h3>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          {/** Cuando se está editando, el nombre no se puede cambiar. Mantenerlo como solo lectura. */}
          {(() => {
            const nombreRegister = isEdit
              ? register('nombre')
              : register('nombre', { required: 'Nombre es obligatorio', minLength: { value: 3, message: 'Mínimo 3 caracteres' } });
            return (
              <input
                {...nombreRegister}
                readOnly={isEdit}
                className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${errors.nombre ? 'border-red-500' : 'border-gray-300'} ${isEdit ? 'bg-gray-100' : ''}`}
                placeholder="Nombre del rol"
              />
            );
          })()}
          {errors.nombre && <p className="text-xs text-red-600 mt-1">{String((errors.nombre as any).message)}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            {...register('descripcion', { maxLength: { value: 255, message: 'Máximo 255 caracteres' } })}
            className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition ${errors.descripcion ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Descripción (opcional)"
            rows={3}
          />
          {errors.descripcion && <p className="text-xs text-red-600 mt-1">{String((errors.descripcion as any).message)}</p>}
        </div>

      </div>

      <div className="flex justify-end gap-3 mt-8">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-white transition shadow cursor-pointer" style={{ backgroundColor: '#e63946' }}>Cancelar</button>
        <button type="submit" className="px-5 py-2 rounded-lg text-white font-medium transition shadow cursor-pointer" style={{ backgroundColor: '#1938bc' }}>{isEdit ? 'Guardar cambios' : 'Guardar'}</button>
      </div>
    </form>
  );
}
