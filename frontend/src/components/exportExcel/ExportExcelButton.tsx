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
      onClick={handleExport}
      className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition flex items-center justify-center"
      title="Exportar Excel"
    >
      <PiMicrosoftExcelLogoFill size={22} />
    </button>
  );
};

export default ExportExcelButton;
