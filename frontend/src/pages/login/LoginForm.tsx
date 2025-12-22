import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../../components/forms/Input';
import Button from '../../components/forms/Button';
import { FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { login } from '../../api/Auth.api';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const schema = z.object({
  username: z.string().min(3, 'El usuario es obligatorio'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      // Paso 1: login
      const res = await login({ username: data.username, password: data.password });
      const token = res.access_token;
      localStorage.setItem('access_token', token);

      // Decodificar payload del JWT para obtener datos del usuario sin llamar a endpoints protegidos
      const parseJwt = (tk: string) => {
        try {
          const payload = tk.split('.')[1];
          const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
          return decoded;
        } catch (e) {
          return null;
        }
      };

      const payload = parseJwt(token) as any;
      // Build frontend user object that satisfies the `User` type
      const frontendUser: any = {
        id: payload?.id ?? null,
        username: payload?.sub ?? data.username,
        name: payload?.name ?? payload?.sub ?? data.username,
        // frontend `User.estado` expects 'activo' | 'inactivo'
        estado: 'activo',
        // keep role_name for UI checks (not part of User type but useful at runtime)
        role_name: payload?.rol ?? null,
      };

      localStorage.setItem('user', JSON.stringify(frontendUser));
      setAuth({ token, user: frontendUser as unknown as import('../../types/Auth.types').User });

      // Redirigir según rol
      const rol = String(frontendUser.role_name ?? '').trim().toUpperCase();
      if (rol === 'ADMINISTRADOR') navigate('/dashboard/atenciones');
      else if (rol === 'ASESOR' || rol === 'FACTURADOR') navigate('/dashboard/atenciones');
      else navigate('/unauthorized');



    } catch (err) {
      if (axios.isAxiosError(err)) {
        setServerError(err.response?.data?.message || 'Error de autenticación');
      } else {
        setServerError('Error inesperado');
      }
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Usuario"
        icon={<FiUser />}
        error={formState.errors.username?.message}
        {...register('username')}
      />

      <Input
        label="Contraseña"
        icon={<FiLock />}
        type={showPassword ? 'text' : 'password'}
        error={formState.errors.password?.message}
        rightElement={(
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        )}
        {...register('password')}
      />

      {serverError && <div className="text-sm text-red-600 mb-3">{serverError}</div>}

      <Button loading={formState.isSubmitting}>Ingresar</Button>
    </form>
  );
}