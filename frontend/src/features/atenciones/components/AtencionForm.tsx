import { useState, useEffect } from 'react';
import type { NewAtencion, Empresa, EstadoAtencion, SeguimientoAtencion, ServicioOption } from '../types';
import { getEmpresas, getEstadosAtencion, getSeguimientosAtencion, getServicios } from '../Atencion.api';

type AtencionFormProps = {
  isEdit?: boolean;
  initial?: Partial<NewAtencion>;
  onCancel: () => void;
  onSave: (data: NewAtencion) => Promise<void>;
};

export default function AtencionForm({ isEdit, initial, onCancel, onSave }: AtencionFormProps) {
  const [idPaciente, setIdPaciente] = useState(initial?.id_paciente || '');
  const [idEmpresa, setIdEmpresa] = useState<number>(initial?.id_empresa || 0);
  const [idEstado, setIdEstado] = useState<number>(initial?.id_estado_atencion || 0);
  const [idSeguimiento, setIdSeguimiento] = useState<number>(initial?.id_seguimiento_atencion || 0);
  const [observacion, setObservacion] = useState(initial?.observacion || '');
  const [selectedServicios, setSelectedServicios] = useState<number[]>(initial?.servicios || []);
  
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [estados, setEstados] = useState<EstadoAtencion[]>([]);
  const [seguimientos, setSeguimientos] = useState<SeguimientoAtencion[]>([]);
  const [servicios, setServicios] = useState<ServicioOption[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getEmpresas(),
      getEstadosAtencion(),
      getSeguimientosAtencion(),
      getServicios()
    ])
      .then(([emp, est, seg, serv]) => {
        setEmpresas(emp);
        setEstados(est);
        setSeguimientos(seg);
        setServicios(serv);
      })
      .catch(err => console.error('Error cargando datos:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!idPaciente.trim()) {
      alert('El ID del paciente es obligatorio');
      return;
    }
    
    if (!idEmpresa) {
      alert('Debe seleccionar una empresa');
      return;
    }
    
    if (!idEstado) {
      alert('Debe seleccionar un estado');
      return;
    }

    const data: NewAtencion = {
      id_paciente: idPaciente.trim(),
      id_empresa: idEmpresa,
      id_estado_atencion: idEstado,
      id_seguimiento_atencion: idSeguimiento || undefined,
      observacion: observacion.trim() || undefined,
      servicios: selectedServicios.length > 0 ? selectedServicios : undefined
    };

    await onSave(data);
  };

  const toggleServicio = (servicioId: number) => {
    setSelectedServicios(prev => 
      prev.includes(servicioId)
        ? prev.filter(id => id !== servicioId)
        : [...prev, servicioId]
    );
  };

  return (
    <div className="bg-white rounded shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <h3 className="text-xl font-bold mb-4">
        {isEdit ? 'Editar Atención' : 'Nueva Atención'}
      </h3>

      {loading ? (
        <div className="text-center py-4">Cargando datos...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ID Paciente */}
          <div>
            <label className="block text-sm font-medium mb-1">
              ID Paciente <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={idPaciente}
              onChange={(e) => setIdPaciente(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: 1234567890"
              disabled={isEdit}
              required
            />
          </div>

          {/* Empresa */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Empresa <span className="text-red-500">*</span>
            </label>
            <select
              value={idEmpresa}
              onChange={(e) => setIdEmpresa(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value={0}>-- Seleccionar Empresa --</option>
              {empresas.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              value={idEstado}
              onChange={(e) => setIdEstado(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value={0}>-- Seleccionar Estado --</option>
              {estados.map(est => (
                <option key={est.id} value={est.id}>
                  {est.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Seguimiento */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Seguimiento (Opcional)
            </label>
            <select
              value={idSeguimiento}
              onChange={(e) => setIdSeguimiento(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>-- Sin Seguimiento --</option>
              {seguimientos.map(seg => (
                <option key={seg.id} value={seg.id}>
                  {seg.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Observación */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Observación
            </label>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Observaciones adicionales..."
            />
          </div>

          {/* Servicios */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Servicios (Seleccione uno o varios)
            </label>
            <div className="border border-gray-300 rounded p-3 max-h-48 overflow-y-auto space-y-2">
              {servicios.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay servicios disponibles</p>
              ) : (
                servicios.map(serv => (
                  <label key={serv.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedServicios.includes(serv.id)}
                      onChange={() => toggleServicio(serv.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{serv.nombre}</span>
                  </label>
                ))
              )}
            </div>
            {selectedServicios.length > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                {selectedServicios.length} servicio(s) seleccionado(s)
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {isEdit ? 'Actualizar' : 'Crear'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
