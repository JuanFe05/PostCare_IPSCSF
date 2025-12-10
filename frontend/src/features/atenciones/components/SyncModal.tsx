import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: (fechaInicio: string, fechaFin: string) => Promise<void>;
}

export default function SyncModal({ isOpen, onClose, onSync }: SyncModalProps) {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fechaInicio || !fechaFin) {
      return;
    }

    try {
      setLoading(true);
      await onSync(fechaInicio, fechaFin);
      setFechaInicio('');
      setFechaFin('');
      onClose();
    } catch (error) {
      console.error('Error en sincronización:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Panel content (no overlay) — parent should render overlay wrapper
  return (
    <div className="bg-white rounded shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Sincronizar Atenciones y Pacientes</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
          disabled={loading}
        >
          <FaTimes className="text-xl" />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              id="fechaInicio"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              id="fechaFin"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              min={fechaInicio}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          {(() => {
            const cancelDisabled = loading;
            const submitDisabled = loading || !fechaInicio || !fechaFin;
            return (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={cancelDisabled}
                  className={`px-4 py-2 text-white rounded transition-colors ${cancelDisabled ? 'bg-[#d33] opacity-60 cursor-not-allowed' : 'bg-[#d33] hover:bg-[#b32626] cursor-pointer'}`}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={submitDisabled}
                  className={`px-4 py-2 text-white rounded transition-colors flex items-center gap-2 ${submitDisabled ? 'bg-blue-300 opacity-60 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sincronizando...
                    </>
                  ) : (
                    'Sincronizar'
                  )}
                </button>
              </>
            );
          })()}
        </div>
      </form>
    </div>
  );
}
