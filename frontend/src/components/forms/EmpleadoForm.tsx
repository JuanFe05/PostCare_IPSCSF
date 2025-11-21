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
import { useState } from 'react';
import { createUsuario } from '../../api/Usuarios.api';
import type { Usuario } from '../../types/Usuario';

interface Props {
  open: boolean;
  onClose: () => void;
  onUsuarioCreado: (nuevo: Usuario) => void;
}

const EmpleadoForm = ({ open, onClose, onUsuarioCreado }: Props) => {
  const [form, setForm] = useState<Usuario>({
    id: 0,
    username: '',
    email: '',
    password: '',
    estado: true,
    role_id: 0,
    role_name: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
    } catch (error) {
      console.error('Error al registrar usuario:', error);
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
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="Email"
          name="email"
          fullWidth
          value={form.email}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="Contraseña"
          name="password"
          type="password"
          fullWidth
          value={form.password}
          onChange={handleChange}
        />

        <FormControl fullWidth margin="dense">
          <InputLabel id="rol-label">Rol</InputLabel>
          <Select
            labelId="rol-label"
            name="rol"
            value={form.role_id}
            onChange={(e) => setForm({ ...form, role_id: Number(e.target.value) })}
            label="Rol"
          >
            <MenuItem value="ASESOR">ASESOR</MenuItem>
            <MenuItem value="ADMINISTRADOR">ADMINISTRADOR</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel id="estado-label">Estado</InputLabel>
          <Select
            labelId="estado-label"
            value={form.estado ? 'activo' : 'inactivo'}
            onChange={(e) =>
              setForm({ ...form, estado: e.target.value === 'activo' })
            }
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