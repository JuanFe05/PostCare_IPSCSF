import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiCalendar } from 'react-icons/fi';
import { FaSyncAlt } from 'react-icons/fa';
import { MdError, MdInfo } from 'react-icons/md';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: (fechaInicio: string, fechaFin: string) => Promise<void>;
}

export default function SyncModal({ isOpen, onClose, onSync }: SyncModalProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!startDate || !endDate) {
      setError('Por favor seleccione ambas fechas');
      return;
    }

    if (startDate > endDate) {
      setError('La fecha inicio debe ser anterior o igual a la fecha fin');
      return;
    }

    try {
      setLoading(true);
      // Formatear fechas a YYYY-MM-DD
      const fechaInicio = startDate.toISOString().split('T')[0];
      const fechaFin = endDate.toISOString().split('T')[0];
      await onSync(fechaInicio, fechaFin);
      setStartDate(null);
      setEndDate(null);
      onClose();
    } catch (error) {
      console.error('Error en sincronización:', error);
      setError('Error al sincronizar. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setStartDate(null);
      setEndDate(null);
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all">
        {/* Header */}
        <div className="px-6 py-5 rounded-t-2xl" style={{ backgroundColor: '#1a338e' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">Sincronizar Datos</h2>
                <p className="text-blue-200 text-sm">Desde la Base de Datos de la Clínica</p>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Fecha Inicio */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Fecha Inicio
              </label>
              <div className="relative">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => {
                    setStartDate(date);
                    setError('');
                  }}
                  selectsStart
                  startDate={startDate || undefined}
                  endDate={endDate || undefined}
                  maxDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Seleccione fecha inicio"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  disabled={loading}
                  calendarClassName="shadow-xl"
                />
                <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sky-600" size={20} />
              </div>
            </div>

            {/* Fecha Fin */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Fecha Fin
              </label>
              <div className="relative">
                <DatePicker
                  selected={endDate}
                  onChange={(date) => {
                    setEndDate(date);
                    setError('');
                  }}
                  selectsEnd
                  startDate={startDate || undefined}
                  endDate={endDate || undefined}
                  minDate={startDate || undefined}
                  maxDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Seleccione fecha fin"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                  disabled={loading}
                  calendarClassName="shadow-xl"
                />
                <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sky-600" size={20} />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-shake">
                <MdError className="w-5 h-5" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
              <div className="flex gap-3">
                <MdInfo className="w-5 h-5 text-sky-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-sky-800">
                  <p className="font-medium mb-1">Información importante:</p>
                  <ul className="list-disc list-inside space-y-1 text-sky-700">
                    <li>Se sincronizarán pacientes y atenciones del rango seleccionado</li>
                    <li>Solo se crearán nuevos registros</li>
                    <li>Los datos existentes NO serán modificados</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-red-400 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !startDate || !endDate}
              className="flex-1 px-6 py-3 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 shadow-lg" style={{ backgroundColor: '#1a338e' }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#152156')} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#1a338e')}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <FaSyncAlt size={20} />
                  <span>Sincronizar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
