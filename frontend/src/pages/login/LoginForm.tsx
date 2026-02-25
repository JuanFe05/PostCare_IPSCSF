import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login } from '../../api/Auth.api';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/notus/Input';
import Button from '../../components/notus/Button';


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

      // Redirigir a la página de análisis (dashboard)
      navigate('/dashboard');



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
        icon="fas fa-user"
        error={formState.errors.username?.message}
        {...register('username')}
      />

      <div className="relative mb-3">
        <Input
          label="Contraseña"
          icon="fas fa-lock"
          type={showPassword ? 'text' : 'password'}
          error={formState.errors.password?.message}
          {...register('password')}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-11 text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
        </button>
      </div>

      {serverError && (
        <div className="text-red-500 text-center mb-3 p-3 bg-red-50 rounded">
          <i className="fas fa-exclamation-circle mr-2" />
          {serverError}
        </div>
      )}

      <div className="text-center mt-6">
        <Button
          type="submit"
          color="lightBlue"
          fullWidth
          disabled={formState.isSubmitting}
        >
          {formState.isSubmitting ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2" />
              Ingresando...
            </>
          ) : (
            <>
              <i className="fas fa-sign-in-alt mr-2" />
              Ingresar
            </>
          )}
        </Button>
      </div>
    </form>
  );
}