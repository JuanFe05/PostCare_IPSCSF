import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getTiposEmpresas } from "../Empresa.api";
import type { TipoEmpresa } from "../types";
import { FiBriefcase } from 'react-icons/fi';
import { MdError } from 'react-icons/md';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-sky-700 px-6 py-5 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                {isEdit ? 'Editar Empresa' : 'Nueva Empresa'}
              </h2>
              <p className="text-white text-sm">
                {isEdit ? 'Actualice los datos de la empresa' : 'Registre una nueva empresa'}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit, onError)} className="p-6">
          <div className="space-y-6">
            {/* Sección: Información General */}
            <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg p-4 border border-sky-200">
              <h3 className="text-sm font-bold text-sky-900 mb-4 flex items-center gap-2">
                <FiBriefcase className="text-sky-600" />
                Información General
              </h3>
              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre de la empresa <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("nombre", {
                      required: "El nombre es obligatorio",
                      minLength: { value: 2, message: "Mínimo 2 caracteres" },
                    })}
                    type="text"
                    placeholder="Ej: Salud Total EPS"
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {errors.nombre && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <MdError size={16} />
                      <p className="text-xs">{String((errors.nombre as any).message)}</p>
                    </div>
                  )}
                </div>

                {/* Tipo de empresa */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de empresa <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("id_tipo_empresa", {
                      required: "El tipo de empresa es obligatorio",
                      validate: (val) => val !== '' || "Debe seleccionar un tipo",
                    })}
                    disabled={loadingTipos}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Seleccione un tipo</option>
                    {tiposEmpresas.map((tipo) => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.id_tipo_empresa && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <MdError size={16} />
                      <p className="text-xs">{String((errors.id_tipo_empresa as any).message)}</p>
                    </div>
                  )}
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-sky-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              {isEdit ? "Guardar cambios" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
