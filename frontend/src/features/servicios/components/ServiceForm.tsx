import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface ServiceFormProps {
  onCancel: () => void;
  onSave: (data: { nombre: string; descripcion?: string }) => void;
  initial?: { nombre?: string; descripcion?: string };
  isEdit?: boolean;
}

export default function ServiceForm({ onCancel, onSave, initial = {}, isEdit = false }: ServiceFormProps) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (initial.nombre) setValue("nombre", initial.nombre);
    if (initial.descripcion) setValue("descripcion", initial.descripcion);
  }, []);

  const onSubmit = (data: any) => {
    onSave({
      nombre: data.nombre.trim(),
      descripcion: data.descripcion?.trim() || "",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-xl w-[420px] border border-gray-200">
      <h3 className="text-2xl font-semibold mb-6 text-gray-800">{isEdit ? "Editar servicio" : "Nuevo servicio"}</h3>

      <div className="grid gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del servicio</label>
          <input
            {...register("nombre", {
              required: "El nombre es obligatorio",
              minLength: { value: 2, message: "Mínimo 2 caracteres" },
            })}
            type="text"
            placeholder="Ej: Consulta médica"
            className={`w-full p-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.nombre && <p className="text-xs text-red-600 mt-1">{String(errors.nombre.message)}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
          <textarea
            {...register("descripcion")}
            placeholder="Ej: Servicio orientado a atención personalizada del cliente"
            rows={3}
            className="w-full p-2.5 border rounded-lg shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500 transition resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-300 text-gray-800 hover:bg-gray-400 transition shadow">
          Cancelar
        </button>
        <button type="submit" className="px-5 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition shadow">
          {isEdit ? "Guardar cambios" : "Guardar"}
        </button>
      </div>
    </form>
  );
}