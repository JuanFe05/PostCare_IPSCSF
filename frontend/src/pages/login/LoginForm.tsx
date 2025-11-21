import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../../components/forms/Input';
import Button from '../../components/forms/Button';
import { FiLock, FiUser } from 'react-icons/fi';
import { login } from '../../api/Auth.api';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const schema = z.object({
  username: z.string().min(3, 'El usuario es obligatorio'),
  password: z.string().min(3, 'Mínimo 3 caracteres'),
});

type FormData = z.infer<typeof schema>;

export default function LoginForm() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

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

      // Paso 2: obtener usuario completo
      console.log('Token que se usará en el header:', token);
      const userRes = await axios.get('http://localhost:48555/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = userRes.data[0];
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Usuario guardado en localStorage:', JSON.parse(localStorage.getItem('user') || '{}'));
      setAuth({ token, user });

      console.log("Tipo de userRes.data:", typeof userRes.data);
      console.log("Contenido completo:", userRes.data);


      // Paso 3: redirigir según rol
      const rol = (user.role_name || "").trim().toUpperCase();
      console.log('Rol detectado:', rol);


      if (rol === "ADMINISTRADOR") {
  console.log("Redirigiendo a /dashboard");
  navigate("/dashboard");
} else if (rol === "ASESOR") {
  console.log("Redirigiendo a /not-found");
  navigate("/not-found");
} else {
  console.log("Redirigiendo a /unauthorized");
  navigate("/unauthorized");
}



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
        type="password"
        error={formState.errors.password?.message}
        {...register('password')}
      />

      {serverError && <div className="text-sm text-red-600 mb-3">{serverError}</div>}

      <Button loading={formState.isSubmitting}>Ingresar</Button>
    </form>
  );
}