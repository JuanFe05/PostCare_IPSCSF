import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { exportToExcel } from "../../utils/exportToExcel";

interface Props {
  data: any[];
  fileName: string;
}

const ExportExcelButton = ({ data, fileName }: Props) => {
  const handleExport = () => {
    exportToExcel(data, fileName);
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