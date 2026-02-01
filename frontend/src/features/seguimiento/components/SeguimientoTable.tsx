import { useMemo } from "react";
import SeguimientoRow from "./SeguimientoRow";
import { Table } from '../../../components/notus';

export interface TipoSeguimiento {
  id: number;
  nombre: string;
  descripcion?: string;
}

interface SeguimientoTableProps {
  tipos: TipoSeguimiento[];
  loading: boolean;
  searchTerm: string;
  auth: any;
  setEditTipo: (tipo: TipoSeguimiento) => void;
  setShowEdit: (show: boolean) => void;
  handleDelete: (id: number, nombre: string) => Promise<void>;
}

export default function SeguimientoTable({ 
  tipos, 
  loading, 
  searchTerm,
  auth,
  setEditTipo,
  setShowEdit,
  handleDelete 
}: SeguimientoTableProps) {
  const displayedTipos = useMemo(() => {
    const q = String(searchTerm ?? '').trim().toLowerCase();
    return tipos.filter((t: TipoSeguimiento) => {
      if (!q) return true;
      const id = String(t.id ?? '').toLowerCase();
      const nombre = String(t.nombre ?? '').toLowerCase();
      const desc = String(t.descripcion ?? '').toLowerCase();
      return id.includes(q) || nombre.includes(q) || desc.includes(q);
    });
  }, [tipos, searchTerm]);

  return loading ? (
    <div className="text-center py-8">Cargando tipos...</div>
  ) : (
    <Table headers={['ID', 'Nombre', 'Descripción', 'Acciones']} color="light">
      {displayedTipos.length === 0 ? (
        <tr>
          <td colSpan={4} className="p-6 text-center text-gray-500">
            {searchTerm ? `No se encontraron tipos que coincidan con "${searchTerm}".` : 'No hay tipos registrados.'}
          </td>
        </tr>
      ) : (
        displayedTipos.map((t: TipoSeguimiento) => (
          <tr key={t.id} className="hover:bg-blue-50">
            <SeguimientoRow 
              tipo={t} 
              auth={auth} 
              setEditTipo={setEditTipo} 
              setShowEdit={setShowEdit} 
              handleDelete={handleDelete} 
            />
          </tr>
        ))
      )}
    </Table>
  );
}
