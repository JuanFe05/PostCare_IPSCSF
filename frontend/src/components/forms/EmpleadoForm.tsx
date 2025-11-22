// ...existing code...
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { useState } from 'react';
import { createUsuario } from '../../api/Usuarios.api';
import type { Usuario, NewUsuario } from '../../types/Usuario';

interface Props {
  open: boolean;
  onClose: () => void;
  onUsuarioCreado: (nuevo: Usuario) => void;
}

const EmpleadoForm = ({ open, onClose, onUsuarioCreado }: Props) => {
  const [form, setForm] = useState<NewUsuario>({
    username: '',
    email: '',
    password: '',
    estado: true,
    role_id: 2, // 2 = ASESOR por defecto
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (e: SelectChangeEvent<string | number>) => {
    setForm((prev) => ({ ...prev, role_id: Number(e.target.value) }));
  };

  const handleEstadoChange = (e: SelectChangeEvent<string>) => {
    setForm((prev) => ({ ...prev, estado: (e.target.value as string) === 'activo' }));
  };

  const handleSubmit = async () => {
    if (!form.username || !form.email || !form.password || !form.role_id) {
      alert('Todos los campos son obligatorios');
      return;
    }

    try {
      const nuevo = await createUsuario(form);
      onUsuarioCreado(nuevo);
      onClose();
      // opcional: limpiar formulario
      setForm({
        username: '',
        email: '',
        password: '',
        estado: true,
        role_id: 2,
      });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      alert('Error al registrar usuario. Revisa la consola.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Registrar nuevo empleado</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Username"
          name="username"
          fullWidth
          value={form.username}
          onChange={handleInputChange}
        />
        <TextField
          margin="dense"
          label="Email"
          name="email"
          fullWidth
          value={form.email}
          onChange={handleInputChange}
        />
        <TextField
          margin="dense"
          label="Contraseña"
          name="password"
          type="password"
          fullWidth
          value={form.password}
          onChange={handleInputChange}
        />

        <FormControl fullWidth margin="dense">
          <InputLabel id="rol-label">Rol</InputLabel>
          <Select
            labelId="rol-label"
            name="role_id"
            value={form.role_id}
            onChange={handleRoleChange}
            label="Rol"
          >
            <MenuItem value={2}>ASESOR</MenuItem>
            <MenuItem value={1}>ADMINISTRADOR</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel id="estado-label">Estado</InputLabel>
          <Select
            labelId="estado-label"
            value={form.estado ? 'activo' : 'inactivo'}
            onChange={handleEstadoChange}
            label="Estado"
          >
            <MenuItem value="activo">Activo</MenuItem>
            <MenuItem value="inactivo">Inactivo</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained">
          Registrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmpleadoForm;
