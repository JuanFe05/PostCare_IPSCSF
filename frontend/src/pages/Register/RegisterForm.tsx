import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../../components/forms/Input';
import { FiLock, FiUser } from 'react-icons/fi';
import { register as registerApi } from '../../api/Auth.api';

// Validación con Zod
const schema = z.object({
  name: z.string().min(2, 'Nombre muy corto'),
  username: z.string().min(4, 'Usuario obligatorio'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirm: z.string().min(6, 'Confirmación requerida'),
}).refine((d) => d.password === d.confirm, {
  path: ['confirm'],
  message: 'Las contraseñas no coinciden',
});

type FormData = z.infer<typeof schema>;

export default function RegisterForm() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setServerMessage(null);

    try {
      const res = await registerApi({
        name: data.name,
        username: data.username,
        password: data.password,
      });

      setServerMessage(res.message || 'Cuenta creada correctamente');
      setTimeout(() => (globalThis.location.href = '/'), 1200);

    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'message' in err) {
        setServerError((err as { message: string }).message);
      } else {
        setServerError('Error de autenticación');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Nombre completo"
        icon={<FiUser />}
        error={formState.errors.name?.message}
        {...register('name')}
      />

      <Input
        label="Usuario / Documento"
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

      <Input
        label="Confirmar contraseña"
        icon={<FiLock />}
        type="password"
        error={formState.errors.confirm?.message}
        {...register('confirm')}
      />

      {serverError && <div className="text-sm text-red-500 mb-3">{serverError}</div>}
      {serverMessage && <div className="text-sm text-green-500 mb-3">{serverMessage}</div>}

    </form>
  );
}
