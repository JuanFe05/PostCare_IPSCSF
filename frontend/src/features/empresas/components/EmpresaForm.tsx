import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getTiposEmpresas } from "../Empresa.api";
import type { TipoEmpresa } from "../types";

interface EmpresaFormProps {
  onCancel: () => void;
  onSave: (data: { id_tipo_empresa: number; nombre: string }) => void;
  initial?: { id_tipo_empresa?: number; nombre?: string } | null;
  isEdit?: boolean;
}

export default function EmpresaForm({ onCancel, onSave, initial = null, isEdit = false }: EmpresaFormProps) {
  const { register, handleSubmit, reset, setFocus, formState: { errors } } = useForm<any>();
  const [tiposEmpresas, setTiposEmpresas] = useState<TipoEmpresa[]>([]);
  const [loadingTipos, setLoadingTipos] = useState(true);

  useEffect(() => {
    loadTipos();
  }, []);

  const loadTipos = async () => {
    try {
      const data = await getTiposEmpresas();
      setTiposEmpresas(data);
    } catch (err) {
      console.error("Error cargando tipos de empresas:", err);
    } finally {
      setLoadingTipos(false);
    }
  };

  useEffect(() => {
    const init = initial ?? {};
    reset({
      id_tipo_empresa: init.id_tipo_empresa ?? '',
      nombre: init.nombre ?? '',
    });
  }, [initial, reset]);

  const onSubmit = (data: any) => {
    onSave({
      id_tipo_empresa: parseInt(String(data.id_tipo_empresa)),
      nombre: String(data.nombre ?? '').trim(),
    });
  };

  const onError = (errs: any) => {
    const first = Object.keys(errs || {})[0];
    if (first) setFocus(first as any);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)} className="bg-white p-8 rounded-xl shadow-xl w-full max-w-[720px] border border-gray-200">
      <h3 className="text-2xl font-semibold mb-6 text-gray-800">{isEdit ? "Editar empresa" : "Nueva empresa"}</h3>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la empresa</label>
          <input
            {...register("nombre", {
              required: "El nombre es obligatorio",
              minLength: { value: 2, message: "Mínimo 2 caracteres" },
            })}
            type="text"
            placeholder="Ej: Salud Total EPS"
            className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.nombre && <p className="text-xs text-red-600 mt-1">{String((errors.nombre as any).message)}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de empresa</label>
          <select
            {...register("id_tipo_empresa", {
              required: "El tipo de empresa es obligatorio",
              validate: (val) => val !== '' || "Debe seleccionar un tipo",
            })}
            disabled={loadingTipos}
            className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 transition ${errors.id_tipo_empresa ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Seleccione un tipo</option>
            {tiposEmpresas.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
          {errors.id_tipo_empresa && <p className="text-xs text-red-600 mt-1">{String((errors.id_tipo_empresa as any).message)}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-white transition shadow cursor-pointer" style={{ backgroundColor: '#e63946' }}>
          Cancelar
        </button>
        <button type="submit" className="px-5 py-2 rounded-lg text-white font-medium transition shadow cursor-pointer" style={{ backgroundColor: '#1938bc' }}>
          {isEdit ? "Guardar cambios" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
