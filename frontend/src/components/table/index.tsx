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
import { RiEdit2Line, RiDeleteBin6Line } from 'react-icons/ri';
import { useState, useEffect } from 'react';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../../api/Usuarios.api';
import type { Usuario } from '../../types/Usuario';

const getEstadoChip = (estado: boolean) => {
  const label = estado ? 'ACTIVO' : 'INACTIVO';
  const color = estado ? 'success' : 'error';
  return <Chip label={label} color={color} variant="outlined" />;
};

const Table = () => {
  const [open, setOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nuevoEmpleado, setNuevoEmpleado] = useState<Usuario>({
    id: 0,
    username: '',
    email: '',
    estado: true,
    role_id: 0,
    rol: '',
  });

  useEffect(() => {
    getUsuarios()
      .then(setUsuarios)
      .catch((err) => console.error('Error al cargar usuarios:', err));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoEmpleado((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const { username, email, password, rol } = nuevoEmpleado;
    if (!username || !email || !password || !rol) {
      alert('Todos los campos son obligatorios');
      return;
    }

    try {
      if (modoEdicion) {
        await updateUsuario(nuevoEmpleado);
        setUsuarios((prev) =>
          prev.map((u) => (u.id === nuevoEmpleado.id ? nuevoEmpleado : u))
        );
      } else {
        const nuevo = await createUsuario(nuevoEmpleado);
        setUsuarios((prev) => [...prev, nuevo]);
      }
      setOpen(false);
      setModoEdicion(false);
      setNuevoEmpleado({
        id: 0,
        username: '',
        email: '',
        estado: true,
        role_id: 0,
        rol: '',
      });
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  };

  const handleEditar = (usuario: Usuario) => {
    setNuevoEmpleado({ ...usuario, password: '' });
    setModoEdicion(true);
    setOpen(true);
  };

  const handleEliminar = async (username: string) => {
    if (confirm(`¿Eliminar al usuario ${username}?`)) {
      try {
        await deleteUsuario(username);
        setUsuarios((prev) => prev.filter((u) => u.username !== username));
      } catch (err) {
        console.error('Error al eliminar usuario:', err);
      }
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
            rol: '',
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
            {usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>{usuario.id}</TableCell>
                <TableCell>{usuario.username}</TableCell>
                <TableCell align="right">{usuario.email}</TableCell>
                <TableCell align="right">{usuario.rol}</TableCell>
                <TableCell align="right">{getEstadoChip(usuario.estado)}</TableCell>
                <TableCell align="center">
                  <div className="flex justify-center items-center gap-3">
                    <RiEdit2Line
                      className="text-blue-600 text-xl cursor-pointer hover:text-blue-800 transition"
                      onClick={() => handleEditar(usuario)}
                    />
                    <RiDeleteBin6Line
                      className="text-red-600 text-xl cursor-pointer hover:text-red-800 transition"
                      onClick={() => handleEliminar(usuario.username)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableMui>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{modoEdicion ? 'Editar empleado' : 'Registrar nuevo empleado'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Username"
            name="username"
            fullWidth
            value={nuevoEmpleado.username}
            onChange={handleChange}
            disabled={modoEdicion}
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            fullWidth
            value={nuevoEmpleado.email}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Contraseña"
            name="password"
            type="password"
            fullWidth
            value={nuevoEmpleado.password}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Rol (Asesor o Administrador)"
            name="role_name"
            fullWidth
            value={nuevoEmpleado.rol}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Estado</InputLabel>
            <Select
              value={nuevoEmpleado.estado ? 'activo' : 'inactivo'}
              onChange={(e) =>
                setNuevoEmpleado({
                  ...nuevoEmpleado,
                  estado: e.target.value === 'activo',
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