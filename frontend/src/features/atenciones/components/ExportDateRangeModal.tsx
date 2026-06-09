import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiCalendar } from 'react-icons/fi';
import { IoMdDownload } from 'react-icons/io';
import { MdError, MdInfo } from 'react-icons/md';
import { FormModal, SectionCard, FieldGroup, ModalFooter } from '../../../components/animate-ui/form-modal';

interface ExportDateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (startDate: Date, endDate: Date) => void;
  isLoading?: boolean;
}

const ExportDateRangeModal = ({ 
  isOpen, 
  onClose, 
  onExport, 
  isLoading = false 
}: ExportDateRangeModalProps) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
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

    onExport(startDate, endDate);
  };

  const handleClose = () => {
    if (!isLoading) {
      setStartDate(null);
      setEndDate(null);
      setError('');
      onClose();
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Exportar Atenciones"
      subtitle="Seleccione el rango de fechas"
      icon={<IoMdDownload size={20} />}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} id="export-form" className="space-y-4">
        <SectionCard index={0} icon={<FiCalendar />} title="Rango de Fechas">
          <div className="space-y-4">
            <FieldGroup label="Fecha Inicio">
              <div className="relative">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => { setStartDate(date); setError(''); }}
                  selectsStart
                  startDate={startDate || undefined}
                  endDate={endDate || undefined}
                  maxDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Seleccione fecha inicio"
                  className="w-full px-4 py-2.5 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  disabled={isLoading}
                  calendarClassName="shadow-xl"
                  popperPlacement="bottom-start"
                  popperProps={{ strategy: 'fixed' }}
                />
                <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 pointer-events-none" size={18} />
              </div>
            </FieldGroup>

            <FieldGroup label="Fecha Fin">
              <div className="relative">
                <DatePicker
                  selected={endDate}
                  onChange={(date) => { setEndDate(date); setError(''); }}
                  selectsEnd
                  startDate={startDate || undefined}
                  endDate={endDate || undefined}
                  minDate={startDate || undefined}
                  maxDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Seleccione fecha fin"
                  className="w-full px-4 py-2.5 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  disabled={isLoading}
                  calendarClassName="shadow-xl"
                  popperPlacement="bottom-start"
                  popperProps={{ strategy: 'fixed' }}
                />
                <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-600 pointer-events-none" size={18} />
              </div>
            </FieldGroup>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                <MdError className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <MdInfo className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Información importante:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Solo se exportarán las atenciones dentro del rango seleccionado</li>
                    <li>El archivo incluirá todos los servicios asociados</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <ModalFooter
          onCancel={handleClose}
          isLoading={isLoading}
          submitLabel="Exportar"
          formId="export-form"
          submitDisabled={!startDate || !endDate}
        />
      </form>
    </FormModal>
  );
};

export default ExportDateRangeModal;
