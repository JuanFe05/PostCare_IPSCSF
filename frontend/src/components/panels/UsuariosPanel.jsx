// src/components/panels/UsuariosPanel.jsx
import { useState, useEffect } from "react";
import { getUsuarios } from "../../api/Usuarios.api";

export default function UsuariosPanel() {
  const [showAddUser, setShowAddUser] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsuarios()
      .then((data) => {
        const usuariosArray = Array.isArray(data) ? data : [data];
        setUsuarios(usuariosArray);
      })
      .catch((err) => {
        console.error("Error al cargar usuarios:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Usuarios</h2>

      <button
        onClick={() => setShowAddUser(!showAddUser)}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Agregar nuevo usuario
      </button>

      {showAddUser && (
        <div className="mb-6 p-4 bg-white shadow rounded">
          <input
            type="text"
            placeholder="Nombre"
            className="border p-2 rounded w-full mb-2"
          />
          <input
            type="email"
            placeholder="Correo"
            className="border p-2 rounded w-full mb-2"
          />
          <select className="border p-2 rounded w-full mb-2">
            <option value="">Seleccionar rol</option>
            <option value="ADMINISTRADOR">Administrador</option>
            <option value="ASESOR">Asesor</option>
          </select>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Guardar
          </button>
        </div>
      )}

      {loading && <p>Cargando usuarios...</p>}
      {!loading && usuarios.length === 0 && (
        <p>No hay usuarios registrados.</p>
      )}

      {!loading && usuarios.length > 0 && (
        <table className="w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">ID</th>
              <th className="p-2">Usuario</th>
              <th className="p-2">Correo</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Rol</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td className="p-2">{u.id}</td>
                <td className="p-2">{u.username}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.estado ? "Activo" : "Inactivo"}</td>
                <td className="p-2">{u.role_name}</td>
                <td className="p-2">
                  <button className="text-blue-600 mr-2">Editar</button>
                  <button className="text-red-600">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}