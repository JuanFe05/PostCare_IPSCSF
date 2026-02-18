import { useMemo } from "react";
import type { Service } from "../types";
import ServiceRow from "./ServiceRow";
import Table from "../../../components/notus/Table";

interface ServiceTableProps {
  services: Service[];
  loading: boolean;
  searchTerm: string;
  auth: any;
  attemptEdit: (service: Service) => void;
  handleEliminar: (id: number, nombre: string) => Promise<void>;
}

export default function ServiceTable({ 
  services, 
  loading, 
  searchTerm,
  auth,
  attemptEdit,
  handleEliminar 
}: ServiceTableProps) {

  // displayed (filtered)
  const displayed = useMemo(() => {
    return services.filter((s) => {
      if (!searchTerm) return true;
      const q = searchTerm.trim().toLowerCase();
      const idMatch = String(s.id ?? "").toLowerCase().includes(q);
      const nombreMatch = String(s.nombre ?? "").toLowerCase().includes(q);
      const descMatch = String(s.descripcion ?? "").toLowerCase().includes(q);
      return idMatch || nombreMatch || descMatch;
    });
  }, [services, searchTerm]);

  return loading ? (
    <div className="text-center py-8">
      <i className="fas fa-spinner fa-spin text-3xl text-blue-500" />
      <p className="mt-2 text-gray-600">Cargando servicios...</p>
    </div>
  ) : services.length === 0 ? (
    <div className="text-center py-8 text-gray-500">
      <i className="fas fa-inbox text-4xl mb-2" />
      <p>No hay servicios registrados.</p>
    </div>
  ) : (
    <Table headers={['ID', 'Nombre', 'Descripción', 'Acciones']} color="light">
      {displayed.length === 0 ? (
        <tr>
          <td colSpan={4} className="border-t-0 px-6 align-middle border-l-0 border-r-0 text-center whitespace-nowrap p-4">
            No se encontraron servicios que coincidan con "{searchTerm}".
          </td>
        </tr>
      ) : (
        displayed.map((s) => (
          <tr key={s.id}>
            <ServiceRow 
              service={s} 
              auth={auth} 
              attemptEdit={attemptEdit} 
              handleEliminar={handleEliminar} 
            />
          </tr>
        ))
      )}
    </Table>
  );
}
