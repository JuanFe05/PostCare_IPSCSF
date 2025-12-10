type AtencionPaginationProps = {
  pageIndex: number;
  pageOptions: any[];
  canPreviousPage: boolean;
  canNextPage: boolean;
  dataLength: number;
  gotoPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
};

export default function AtencionPagination({
  pageIndex,
  pageOptions,
  canPreviousPage,
  canNextPage,
  dataLength,
  gotoPage,
  nextPage,
  previousPage,
}: AtencionPaginationProps) {
  if (dataLength <= 7) return null;

  return (
    <div className="flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">
          Mostrando <span className="font-semibold">{pageIndex * 7 + 1}</span> - <span className="font-semibold">{Math.min((pageIndex + 1) * 7, dataLength)}</span> de <span className="font-semibold">{dataLength}</span> atenciones
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => gotoPage(0)} 
          disabled={!canPreviousPage} 
          className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors ${!canPreviousPage ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'}`}
          title="Primera página"
        >
          ««
        </button>
        <button 
          onClick={() => previousPage()} 
          disabled={!canPreviousPage} 
          className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${!canPreviousPage ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'}`}
        >
          Anterior
        </button>
        
        <span className="px-4 py-2 text-sm font-medium text-gray-700">
          Página <span className="font-bold">{pageIndex + 1}</span> de <span className="font-bold">{pageOptions.length}</span>
        </span>
        
        <button 
          onClick={() => nextPage()} 
          disabled={!canNextPage} 
          className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${!canNextPage ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'}`}
        >
          Siguiente
        </button>
        <button 
          onClick={() => gotoPage(pageOptions.length - 1)} 
          disabled={!canNextPage} 
          className={`px-3 py-2 rounded-md border text-sm font-medium transition-colors ${!canNextPage ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 cursor-pointer'}`}
          title="Última página"
        >
          »»
        </button>
      </div>
    </div>
  );
}
