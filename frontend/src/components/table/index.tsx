import {
  Table as TableMui,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { RiEdit2Line, RiDeleteBin6Line } from 'react-icons/ri';
import { useState, useEffect } from 'react';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../../api/Usuarios.api';
import type { Usuario, NewUsuario } from '../../types/Usuario';
import Swal from "sweetalert2";

type NewEmpleadoForm = Partial<Usuario> & {
  password?: string;
  role_name?: string;
};

const getEstadoChip = (estado: boolean) => {
  const label = estado ? 'ACTIVO' : 'INACTIVO';
  const color = estado ? 'success' : 'error';
  return <Chip label={label} color={color} variant="outlined" />;
};

const Table = () => {
  const [open, setOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nuevoEmpleado, setNuevoEmpleado] = useState<NewEmpleadoForm>({
    id: 0,
    username: '',
    email: '',
    estado: true,
    role_id: 0,
    role_name: '',
    password: '',
  });

  //  PAGINACIÓN
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);


  useEffect(() => {
    getUsuarios()
      .then(setUsuarios)
      .catch((err) => console.error('Error al cargar usuarios:', err));
  }, []);

  // Calcular usuarios paginados
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const usuariosPaginados = usuarios.slice(start, end);

  // Evitar que la página quede fuera de rango si eliminas o cambias datos
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(usuarios.length / rowsPerPage));

    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [usuarios, rowsPerPage, page]); // ← incluye `page` en dependencias


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const target = e.target as EventTarget & { name?: string; value?: any };
    const name = target.name ?? '';
    const value = target.value;
    setNuevoEmpleado((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const username = (nuevoEmpleado.username ?? '').toString().trim();
    const email = (nuevoEmpleado.email ?? '').toString().trim();
    const password = (nuevoEmpleado.password ?? '').toString();
    const rolStr = (nuevoEmpleado.role_id ?? nuevoEmpleado.role_name ?? '').toString().trim().toUpperCase();

    if (!username || !email || !rolStr || (!modoEdicion && !password)) {
      alert('Todos los campos son obligatorios (contraseña sólo requerida al crear).');
      return;
    }

    try {
      const role_id = rolStr === 'ADMINISTRADOR' ? 1 : 2;

      if (modoEdicion) {
        const actualizado: Usuario = {
          ...(nuevoEmpleado as Usuario),
          role_id,
          role_name: rolStr,
        };
        await updateUsuario(actualizado);
        setUsuarios((prev) => prev.map((u) => (u.id === actualizado.id ? actualizado : u)));
      } else {
        const payload: NewUsuario = {
          username,
          email,
          password: nuevoEmpleado.password ?? undefined,
          password_hash: nuevoEmpleado.password_hash ?? undefined,
          estado: nuevoEmpleado.estado ?? true,
          role_id,
        };
        const nuevo = await createUsuario(payload);
        setUsuarios((prev) => [nuevo, ...prev]);
      }

      setOpen(false);
      setModoEdicion(false);
      setNuevoEmpleado({
        id: 0,
        username: '',
        email: '',
        estado: true,
        role_id: 0,
        role_name: '',
        password: '',
      });
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert('Error al guardar usuario. Revisa la consola.');
    }
  };

  const handleEditar = (usuario: Usuario) => {
    setNuevoEmpleado({
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      estado: usuario.estado,
      role_id: usuario.role_id,
      role_name: usuario.role_name,
      password: '',
    });

    setModoEdicion(true);
    setOpen(true);
  };

  const handleEliminar = async (id: number, username: string) => {
    const result = await Swal.fire({
      title: `¿Eliminar a ${username}?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33", // rojo profesional
      cancelButtonColor: "#6c757d", // gris elegante
      background: "#fefefe", // fondo claro
      customClass: {
        popup: "rounded-lg shadow-md",
        title: "text-lg font-semibold",
        confirmButton: "px-4 py-2",
        cancelButton: "px-4 py-2",
      },
    });

    if (!result.isConfirmed) return;

    try {
      await deleteUsuario(id); // ← usa el ID, no el username
      setUsuarios((prev) => prev.filter((u) => u.id !== id)); // ← filtra por ID
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
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Gestión de Usuarios
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setOpen(true);
          setModoEdicion(false);
          setNuevoEmpleado({
            id: 0,
            username: '',
            email: '',
            estado: true,
            role_id: 0,
            role_name: '',
            password: '',
          });
        }}
        sx={{ mb: 2 }}
      >
        Añadir nuevo empleado
      </Button>

      <TableContainer component={Paper}>
        <TableMui sx={{ minWidth: 750 }} aria-label="tabla de usuarios">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Rol</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {usuariosPaginados.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>{usuario.id}</TableCell>
                <TableCell>{usuario.username}</TableCell>
                <TableCell align="right">{usuario.email}</TableCell>
                <TableCell align="right">{usuario.role_name}</TableCell>
                <TableCell align="right">{getEstadoChip(usuario.estado ?? true)}</TableCell>
                <TableCell align="center">
                  <div className="flex justify-center items-center gap-3">
                    <RiEdit2Line
                      className="text-blue-600 text-xl cursor-pointer hover:text-blue-800 transition"
                      onClick={() => handleEditar(usuario)}
                    />
                    <RiDeleteBin6Line
                      className="text-red-600 text-xl cursor-pointer hover:text-red-800 transition"
                      onClick={() => handleEliminar(usuario.id!, usuario.username)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableMui>
      </TableContainer>

      {/*  PAGINACIÓN */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button
          variant="outlined"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Anterior
        </Button>

        <Typography sx={{ pt: 1 }}>
          Página {page} de {Math.ceil(usuarios.length / rowsPerPage) || 1}
        </Typography>

        <Button
          variant="outlined"
          disabled={end >= usuarios.length}
          onClick={() => setPage(page + 1)}
        >
          Siguiente
        </Button>
      </Box>

      {/* Selector de filas por página */}
      <Box sx={{ mt: 2, width: 200 }}>
        <FormControl fullWidth>
          <InputLabel>Filas por página</InputLabel>
          <Select
            value={rowsPerPage.toString()}
            label="Filas por página"
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(1); // reset página
            }}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{modoEdicion ? 'Editar empleado' : 'Registrar nuevo empleado'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Username"
            name="username"
            fullWidth
            value={nuevoEmpleado.username ?? ''}
            onChange={handleChange}
            disabled={modoEdicion}
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            fullWidth
            value={nuevoEmpleado.email ?? ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Contraseña"
            name="password"
            type="password"
            fullWidth
            value={nuevoEmpleado.password ?? ''}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Rol (Asesor o Administrador)"
            name="rol"
            fullWidth
            value={nuevoEmpleado.role_id ?? nuevoEmpleado.role_name ?? ''}
            onChange={handleChange}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Estado</InputLabel>
            <Select
              value={(nuevoEmpleado.estado ?? true) ? 'activo' : 'inactivo'}
              onChange={(e) =>
                setNuevoEmpleado({
                  ...nuevoEmpleado,
                  estado: (e.target.value as string) === 'activo',
                })
              }
              label="Estado"
            >
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="inactivo">Inactivo</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {modoEdicion ? 'Guardar cambios' : 'Registrar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Table;
