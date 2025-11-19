import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../../components/forms/Input';
import Button from '../../components/forms/Button';
import { FiLock, FiUser } from 'react-icons/fi';
import { login } from '../../api/Auth.api';
import { useAuth } from '../../hooks/useAuth';

// Schema de validación
const schema = z.object({
  username: z.string().min(3, 'El usuario es obligatorio'),
  password: z.string().min(3, 'Mínimo 3 caracteres'),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const { setAuth } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const res = await login({ username: data.username, password: data.password });
      // Guarda token y usuario (mejor usar cookies httpOnly desde backend)
      localStorage.setItem('access_token', res.access_token);
      if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
      setAuth({ token: res.access_token, user: res.user });
      // redirige a dashboard
      globalThis.location.href = '/dashboard';
    } catch (err: any) {
      setServerError(err.message || 'Error de autenticación');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-2xl font-bold mb-2">Bienvenido</h2>
      <p className="text-sm text-gray-500 mb-6">Iniciar sesión para continuar</p>

      <Input
        label="Usuario"
        icon={<FiUser />}
        error={formState.errors.username?.message}
        {...register('username')}
      />

      <Input
        label="Contraseña"
        icon={<FiLock />}
        type="password"
        error={formState.errors.password?.message}
        {...register('password')}
      />

      {serverError && <div className="text-sm text-red-600 mb-3">{serverError}</div>}

      <Button loading={formState.isSubmitting}>Ingresar</Button>
    </form>
  );
}