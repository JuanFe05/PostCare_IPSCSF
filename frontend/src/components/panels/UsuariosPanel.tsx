// src/components/panels/UsuariosPanel.tsx
import { useState, useEffect } from "react";
import { useAuth } from '../../hooks/useAuth';
import type { Usuario } from "../../types/Usuario";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import UsuarioForm from "../../pages/Register/UsuarioForm";
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from "../../api/Usuarios.api";
import Swal from "sweetalert2";

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

  // Nuevo: función para eliminar usuario
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
      background: "#fefefe",
      customClass: {
        popup: "rounded-lg shadow-md",
        title: "text-lg font-semibold",
        confirmButton: "px-4 py-2",
        cancelButton: "px-4 py-2",
      },
    });

    if (!result.isConfirmed) return;

    try {
      await deleteUsuario(id);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      await Swal.fire({
        title: "Eliminado",
        text: `El usuario ${username} ha sido eliminado.`,
        icon: "success",
        confirmButtonColor: "#3085d6",
        background: "#fefefe",
        customClass: {
          popup: "rounded-lg shadow-md",
          title: "text-lg font-semibold",
          confirmButton: "px-4 py-2",
        },
      });
    } catch (error) {
      console.error("Error al eliminar:", error);
      await Swal.fire({
        title: "Error",
        text: "No se pudo eliminar el usuario.",
        icon: "error",
        confirmButtonColor: "#d33",
        background: "#fefefe",
        customClass: {
          popup: "rounded-lg shadow-md",
          title: "text-lg font-semibold",
          confirmButton: "px-4 py-2",
        },
      });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>Usuarios</span>
      </h2>

      {/* Solo administradores pueden crear/editar/ eliminar usuarios */}
      {(() => {
        const role = String(useAuth().auth?.user?.role_name ?? '').trim().toUpperCase();
        if (role === 'ADMINISTRADOR') {
          return (
            <button
              onClick={() => setShowAddUser(true)}
              className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow flex items-center gap-2"
            >
              Agregar nuevo usuario
            </button>
          );
        }
        return <p className="mb-4 text-sm text-gray-600">Solo administradores pueden gestionar usuarios.</p>;
      })()}

      {/* Modal para crear usuario */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <UsuarioForm
            onCancel={() => setShowAddUser(false)}
            onSave={async ({ username, email, role_id, password, estado }) => {
              if (!username || !email || (!password && !role_id)) {
                await Swal.fire({ icon: 'warning', title: 'Datos incompletos', text: 'Completa usuario, email, contraseña y rol.' });
                return;
              }
              setLoading(true);
              try {
                const nuevo = await createUsuario({
                  username,
                  email,
                  password: password, // send password field
                  estado,
                  role_id,
                });
                setUsuarios((prev) => [nuevo, ...prev]);
                setShowAddUser(false);
                await Swal.fire({ icon: 'success', title: 'Usuario creado', text: `Usuario ${username} creado correctamente.` });
              } catch (err) {
                console.error("Error creando usuario:", err);
                await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear el usuario. Revisa la consola.' });
              } finally {
                setLoading(false);
              }
            }}
          />
        </div>
      )}

      {showEditUser && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <UsuarioForm
            onCancel={() => setShowEditUser(false)}
            onSave={async ({ username, email, role_id, estado }) => {
              if (!editUser) return;
              let new_role_id = editUser.role_id ?? 2;
              if (typeof role_id === 'number') new_role_id = role_id;
              setLoading(true);
              try {
                const actualizado = await updateUsuario({
                  ...editUser,
                  username,
                  email,
                  role_id: new_role_id,
                  estado,
                });
                setUsuarios((prev) =>
                  prev.map((u) => (u.id === actualizado.id ? actualizado : u))
                );
                setShowEditUser(false);
                setEditUser(null);
                await Swal.fire({ icon: 'success', title: 'Usuario actualizado', text: `Usuario ${username} actualizado.` });
              } catch (err) {
                console.error("Error actualizando usuario:", err);
                await Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el usuario.' });
              } finally {
                setLoading(false);
              }
            }}
            initial={{
              username: editUser.username,
              email: editUser.email,
              role_id: editUser.role_id,
              estado: editUser.estado,
            }}
            isEdit={true}
          />
        </div>
      )}

      {loading && <p>Cargando usuarios...</p>}
      {!loading && usuarios.length === 0 && <p>No hay usuarios registrados.</p>}

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
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${u.estado
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {u.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${u.role_name === "ADMINISTRADOR"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {u.role_name || ""}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2 justify-center">
                    {(() => {
                      const role = String(useAuth().auth?.user?.role_name ?? '').trim().toUpperCase();
                      if (role === 'ADMINISTRADOR') {
                        return (
                          <>
                            <button
                              className="text-blue-600 hover:text-blue-800 cursor-pointer"
                              onClick={() => {
                                setEditUser(u);
                                setShowEditUser(true);
                              }}
                              title="Editar"
                            >
                              <FiEdit className="text-xl" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800 cursor-pointer"
                              onClick={() => handleEliminar(u.id!, u.username)}
                              title="Eliminar"
                            >
                              <FiTrash2 className="text-xl" />
                            </button>
                          </>
                        );
                      }
                      return <span className="text-sm text-gray-500">Sin acciones</span>;
                    })()}
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