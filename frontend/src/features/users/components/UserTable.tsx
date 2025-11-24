import React, { useState, useEffect } from "react";
import { useAuth } from '../../../hooks/useAuth';
import type { Usuario } from "../types";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import UserForm from "./UserForm";
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from "../api";
import Swal from "sweetalert2";

export default function UserTable() {
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { auth } = useAuth();

  useEffect(() => {
    getUsuarios()
      .then((data) => setUsuarios(data))
      .catch((err) => console.error("Error al cargar usuarios:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleEliminar = async (id: number, username: string) => {
    const result = await Swal.fire({
      title: `¿Eliminar a ${username}?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteUsuario(id);
      setUsuarios((prev: Usuario[]) => prev.filter((u: Usuario) => u.id !== id));
      await Swal.fire({ title: "Eliminado", text: `El usuario ${username} ha sido eliminado.`, icon: "success" });
    } catch (error) {
      console.error("Error al eliminar:", error);
      await Swal.fire({ title: "Error", text: "No se pudo eliminar el usuario.", icon: "error" });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>Gestion de Usuarios</span>
      </h2>

      <div className="mb-4 flex items-center justify-between">
        <div className="flex-shrink-0">
          {(() => {
            const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
            if (role === 'ADMINISTRADOR') {
              return (
                <button onClick={() => setShowAddUser(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow flex items-center gap-2 cursor-pointer">
                  Agregar nuevo usuario
                </button>
              );
            }
            return <p className="text-sm text-gray-600">Solo administradores pueden gestionar usuarios.</p>;
          })()}
        </div>
        <div className="ml-4 flex-shrink-0">
          <input
            type="text"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            placeholder="Buscar por usuario o correo"
            className="w-full p-2 border rounded text-sm"
            style={{ width: '360px' }}
          />
        </div>
      </div>

      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <UserForm onCancel={() => setShowAddUser(false)} onSave={async ({ username, email, role_id, password, estado }) => {
            if (!username || !email || (!password && !role_id)) {
              await Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Completa usuario, email, contraseña y rol.' });
              return;
            }
            setLoading(true);
            try {
              const nuevo = await createUsuario({ username, email, password, estado, role_id });
              setUsuarios((prev: Usuario[]) => [nuevo, ...prev]);
              setShowAddUser(false);
              await Swal.fire({ icon: 'success', title: 'Usuario creado', text: `Usuario ${username} creado correctamente.` });
            } catch (err) {
              console.error("Error creando usuario:", err);
              await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear el usuario.' });
            } finally { setLoading(false); }
          }} />
        </div>
      )}

      {showEditUser && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <UserForm onCancel={() => setShowEditUser(false)} onSave={async ({ username, email, role_id, estado }) => {
            if (!editUser) return;
            let new_role_id = editUser.role_id ?? 2;
            if (typeof role_id === 'number') new_role_id = role_id;
            setLoading(true);
            try {
              const actualizado = await updateUsuario({ ...editUser, username, email, role_id: new_role_id, estado });
              setUsuarios((prev: Usuario[]) => prev.map((u: Usuario) => (u.id === actualizado.id ? actualizado : u)));
              setShowEditUser(false);
              setEditUser(null);
              await Swal.fire({ icon: 'success', title: 'Usuario actualizado', text: `Usuario ${username} actualizado.` });
            } catch (err) {
              console.error("Error actualizando usuario:", err);
              await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el usuario.' });
            } finally { setLoading(false); }
          }} initial={{ username: editUser.username, email: editUser.email, role_id: editUser.role_id, estado: editUser.estado }} isEdit={true} />
        </div>
      )}

      {loading && <p>Cargando usuarios...</p>}
      {!loading && usuarios.length === 0 && <p>No hay usuarios registrados.</p>}

      {!loading && usuarios.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y table-auto">
            <thead className="bg-blue-100 text-blue-900">
              <tr>
                <th className="p-3 font-semibold w-16 text-center">ID</th>
                <th className="p-3 font-semibold w-1/5 text-center">Usuario</th>
                <th className="p-3 font-semibold w-2/5 text-center">Correo</th>
                <th className="p-3 font-semibold w-32 text-center">Estado</th>
                <th className="p-3 font-semibold w-32 text-center">Rol</th>
                <th className="p-3 font-semibold w-32 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {usuarios
                .filter((u) => {
                  if (!searchTerm) return true;
                  const q = searchTerm.trim().toLowerCase();
                  const usernameMatch = String(u.username ?? '').toLowerCase().includes(q);
                  const emailMatch = String(u.email ?? '').toLowerCase().includes(q);
                  return usernameMatch || emailMatch;
                })
                .map((u, idx) => (
                  <tr key={u.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                    <td className="p-3 text-center">{u.id}</td>
                    <td className="p-3 text-center">{u.username}</td>
                    <td className="p-3 text-center">{u.email}</td>
                    <td className="p-3 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${u.estado ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{u.estado ? 'Activo' : 'Inactivo'}</span></td>
                    <td className="p-3 text-center"><span className={`px-2 py-1 rounded text-xs font-bold ${u.role_name === 'ADMINISTRADOR' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{u.role_name || ''}</span></td>
                    <td className="p-3 text-center">
                      <div className="flex gap-2 justify-center">
                        {(() => {
                          const role = String(auth?.user?.role_name ?? '').trim().toUpperCase();
                          if (role === 'ADMINISTRADOR') {
                            return (<>
                              <button className="text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => { setEditUser(u); setShowEditUser(true); }} title="Editar"><FiEdit className="text-xl" /></button>
                              <button className="text-red-600 hover:text-red-800 cursor-pointer" onClick={() => handleEliminar(u.id!, u.username)} title="Eliminar"><FiTrash2 className="text-xl" /></button>
                            </>);
                          }
                          return <span className="text-sm text-gray-500">Sin acciones</span>;
                        })()}
                      </div>
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
