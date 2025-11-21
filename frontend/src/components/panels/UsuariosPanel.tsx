// src/components/panels/UsuariosPanel.tsx
import { useState, useEffect } from "react";
import { getUsuarios } from "../../api/Usuarios.api";
import type { Usuario } from "../../types/Usuario";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import UsuarioForm from "../../pages/register/UsuarioForm";

export default function UsuariosPanel() {
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsuarios()
      .then((data) => {
        setUsuarios(data);
      })
      .catch((err) => {
        console.error("Error al cargar usuarios:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>Usuarios</span>
      </h2>

      <button
        onClick={() => setShowAddUser(true)}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow flex items-center gap-2"
      >
        Agregar nuevo usuario
      </button>

      {/* Modal para crear usuario */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <UsuarioForm
            onCancel={() => setShowAddUser(false)}
            onSave={() => setShowAddUser(false)}
          />
        </div>
      )}

      {/* Modal para editar usuario */}
      {showEditUser && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <UsuarioForm
            onCancel={() => setShowEditUser(false)}
            onSave={() => setShowEditUser(false)}
            initial={{ username: editUser.username, email: editUser.email, rol: editUser.role_name || editUser.rol || "" }}
            isEdit={true}
          />
        </div>
      )}

      {loading && <p>Cargando usuarios...</p>}
      {!loading && usuarios.length === 0 && (
        <p>No hay usuarios registrados.</p>
      )}

      {!loading && usuarios.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow rounded-lg text-center">
            <thead>
              <tr className="bg-blue-100 text-blue-900">
                <th className="p-3 font-semibold text-center">ID</th>
                <th className="p-3 font-semibold text-center">Usuario</th>
                <th className="p-3 font-semibold text-center">Correo</th>
                <th className="p-3 font-semibold text-center">Estado</th>
                <th className="p-3 font-semibold text-center">Rol</th>
                <th className="p-3 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u: Usuario) => (
                <tr key={u.id} className="border-b hover:bg-blue-50">
                  <td className="p-3 text-center">{u.id}</td>
                  <td className="p-3 text-center">{u.username}</td>
                  <td className="p-3 text-center">{u.email}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role_name === 'ADMINISTRADOR' || u.rol === 'ADMINISTRADOR' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {u.role_name || u.rol || ""}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2 justify-center">
                    <button className="text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => { setEditUser(u); setShowEditUser(true); }} title="Editar">
                      <FiEdit className="text-xl" />
                    </button>
                    <button className="text-red-600 hover:text-red-800 cursor-pointer" title="Eliminar">
                      <FiTrash2 className="text-xl" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
