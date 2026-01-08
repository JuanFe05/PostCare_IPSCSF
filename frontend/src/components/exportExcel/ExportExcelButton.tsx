import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { exportToExcel } from "../../utils/exportToExcel";
import Swal from "sweetalert2";

interface Props {
  data?: any[];
  fileName: string;
  onExport?: () => Promise<any[]>;
}

const ExportExcelButton = ({ data, fileName, onExport }: Props) => {
  const handleExport = async () => {
    try {
      let dataToExport = data;
      
      // Si se proporciona onExport, usarlo para obtener los datos
      if (onExport) {
        dataToExport = await onExport();
        
        if (!dataToExport || dataToExport.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Sin datos',
            text: 'No se encontraron datos para exportar en el rango seleccionado.'
          });
          return;
        }
      }
      
      if (!dataToExport || dataToExport.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Sin datos',
          text: 'No hay datos para exportar.'
        });
        return;
      }
      
      exportToExcel(dataToExport, fileName);
      
      if (onExport) {
        Swal.fire({
          icon: 'success',
          title: 'Exportación exitosa',
          text: `Se exportaron ${dataToExport.length} registros.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error: any) {
      // Si el error es por cancelación, no mostrar nada
      if (error?.message === 'Exportación cancelada') {
        return;
      }
      console.error('Error al exportar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo exportar los datos. Por favor intente de nuevo.'
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 shadow flex items-center gap-2 cursor-pointer"
      title="Exportar Excel"
    >
      <PiMicrosoftExcelLogoFill size={24} />
      <span>Exportar</span>
    </button>
  );
};

export default ExportExcelButton;