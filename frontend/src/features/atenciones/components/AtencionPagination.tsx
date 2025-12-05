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
  // Solo mostrar paginación si hay más de 11 registros
  if (dataLength <= 11) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Mostrando <strong>{pageIndex * 11 + 1}</strong> a{' '}
        <strong>{Math.min((pageIndex + 1) * 11, dataLength)}</strong> de{' '}
        <strong>{dataLength}</strong> registros
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => gotoPage(0)}
          disabled={!canPreviousPage}
          className={`px-3 py-1 text-sm rounded ${
            !canPreviousPage
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {'<<'}
        </button>
        <button
          onClick={previousPage}
          disabled={!canPreviousPage}
          className={`px-3 py-1 text-sm rounded ${
            !canPreviousPage
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {'<'}
        </button>

        <span className="text-sm text-gray-700">
          Página <strong>{pageIndex + 1}</strong> de <strong>{pageOptions.length}</strong>
        </span>

        <button
          onClick={nextPage}
          disabled={!canNextPage}
          className={`px-3 py-1 text-sm rounded ${
            !canNextPage
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {'>'}
        </button>
        <button
          onClick={() => gotoPage(pageOptions.length - 1)}
          disabled={!canNextPage}
          className={`px-3 py-1 text-sm rounded ${
            !canNextPage
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {'>>'}
        </button>
      </div>
    </div>
  );
}
