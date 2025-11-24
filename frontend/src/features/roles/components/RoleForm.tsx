import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface RoleFormProps {
  onCancel: () => void;
  onSave: (data: { nombre: string; descripcion: string }) => void;
  initial?: { nombre?: string; descripcion?: string };
  isEdit?: boolean;
}

export default function RoleForm({ onCancel, onSave, initial = {}, isEdit = false }: RoleFormProps) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  // Cargar valores iniciales si es edición
  useEffect(() => {
    if (initial.nombre) setValue("nombre", initial.nombre);
    if (initial.descripcion) setValue("descripcion", initial.descripcion);
  }, []);

  const onSubmit = (data: any) => {
    const payload = {
      nombre: data.nombre.trim(),
      descripcion: data.descripcion.trim(),
    };
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow w-96">
      <h3 className="text-xl font-bold mb-4">
        {isEdit ? "Editar rol" : "Nuevo rol"}
      </h3>

      <div className="grid gap-3">

        {/* NOMBRE */}
        <div>
          <label className="block text-sm font-medium mb-1">Nombre del rol</label>
          <input
            {...register("nombre", { 
              required: "El nombre es obligatorio", 
              minLength: { value: 3, message: "Mínimo 3 caracteres" }
            })}
            type="text"
            placeholder="Ej: Administrador"
            className={`border p-2 rounded w-full ${errors.nombre ? "border-red-500" : ""}`}
          />
          {errors.nombre && (
            <p className="text-xs text-red-600 mt-1">
              {String((errors.nombre as any).message)}
            </p>
          )}
        </div>

        {/* DESCRIPCION */}
        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea
            {...register("descripcion", {
              required: "La descripción es obligatoria",
              minLength: { value: 5, message: "Mínimo 5 caracteres" }
            })}
            placeholder="Describe el rol"
            className={`border p-2 rounded w-full h-20 resize-none ${errors.descripcion ? "border-red-500" : ""}`}
          />
          {errors.descripcion && (
            <p className="text-xs text-red-600 mt-1">
              {String((errors.descripcion as any).message)}
            </p>
          )}
        </div>

      </div>

      {/* BOTONES */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          type="button"
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 cursor-pointer"
          onClick={onCancel}
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
        >
          {isEdit ? "Guardar cambios" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
