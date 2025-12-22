import { useForm } from 'react-hook-form';
import type { EstadoAtencion, EstadoCreate } from '../types';

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
    <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-[600px] border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">{isEdit ? 'Editar Estado' : 'Nuevo Estado'}</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input {...register('nombre', { required: 'El nombre es obligatorio', minLength: { value: 2, message: 'Mínimo 2 caracteres' }, maxLength: { value: 100, message: 'Máximo 100' } })}
            onBlur={(e) => setValue('nombre', e.target.value.trim())}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg" />
          {errors.nombre && <p className="text-red-500 text-xs mt-1">{String(errors.nombre.message)}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea {...register('descripcion')}
            onBlur={(e) => setValue('descripcion', e.target.value.trim())}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg" />
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button type="button" onClick={onCancel} className="px-4 py-1.5 rounded-lg text-white" style={{ backgroundColor: '#e63946' }}>Cancelar</button>
          <button type="submit" className="px-5 py-1.5 rounded-lg text-white" style={{ backgroundColor: '#1938bc' }}>Guardar</button>
        </div>
      </form>
    </div>
  );
}
