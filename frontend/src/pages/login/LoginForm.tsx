import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login } from '../../api/Auth.api';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FiUser, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiLogIn } from 'react-icons/fi';

const schema = z.object({
  username: z.string().min(3, 'El usuario es obligatorio'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  error?: string;
  hasValue: boolean;
  children: React.ReactNode;
}

function Field({ label, icon, error, hasValue, children }: FieldProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '0.78rem',
          fontWeight: 600,
          color: '#4b5563',
          letterSpacing: '0.03em',
          textTransform: 'uppercase' as const,
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: error ? '#ef4444' : hasValue ? '#1a338e' : '#9ca3af',
            pointerEvents: 'none',
            display: 'flex',
            transition: 'color 200ms',
          }}
        >
          {icon}
        </span>
        {children}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            style={{
              margin: 0,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.75rem',
              color: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <FiAlertCircle size={11} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginForm() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { register, handleSubmit, formState, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  });

  const usernameVal = watch('username') || '';
  const passwordVal = watch('password') || '';

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const res = await login({ username: data.username, password: data.password });
      const token = res.access_token;
      localStorage.setItem('access_token', token);

      const parseJwt = (tk: string) => {
        try {
          const payload = tk.split('.')[1];
          const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
          return decoded;
        } catch {
          return null;
        }
      };

      const payload = parseJwt(token) as Record<string, unknown> | null;
      const frontendUser = {
        id: (payload?.id ?? null) as number | null,
        username: (payload?.sub ?? data.username) as string,
        name: (payload?.name ?? payload?.sub ?? data.username) as string,
        estado: 'activo' as const,
        role_name: (payload?.rol ?? null) as string | null,
      };

      localStorage.setItem('user', JSON.stringify(frontendUser));
      setAuth({ token, user: frontendUser as unknown as import('../../types/Auth.types').User });
      navigate('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setServerError(err.response?.data?.message || 'Credenciales incorrectas. Inténtalo de nuevo.');
      } else {
        setServerError('Error inesperado. Inténtalo de nuevo.');
      }
    }
  };

  const inputStyle = (field: string, hasValue: boolean, hasError: boolean): React.CSSProperties => ({
    width: '100%',
    paddingLeft: '44px',
    paddingRight: field === 'password' ? '48px' : '16px',
    paddingTop: '12px',
    paddingBottom: '12px',
    fontSize: '0.9rem',
    fontFamily: "'DM Sans', sans-serif",
    borderRadius: '12px',
    border: `1.5px solid ${
      hasError ? '#fca5a5' :
      focusedField === field ? '#1a338e' :
      hasValue ? '#bfdbfe' :
      '#e5e7eb'
    }`,
    background: hasError ? '#fef9f9' : focusedField === field ? '#f8faff' : 'white',
    color: '#111827',
    outline: 'none',
    boxShadow: hasError
      ? '0 0 0 3px rgba(239,68,68,0.08)'
      : focusedField === field
      ? '0 0 0 3px rgba(26,51,142,0.1)'
      : 'none',
    transition: 'border-color 200ms, box-shadow 200ms, background 200ms',
    boxSizing: 'border-box',
  });

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
    >
      <Field
        label="Usuario"
        icon={<FiUser size={16} />}
        error={formState.errors.username?.message}
        hasValue={!!usernameVal}
      >
        <input
          {...register('username')}
          type="text"
          placeholder="Tu nombre de usuario"
          autoComplete="username"
          style={inputStyle('username', !!usernameVal, !!formState.errors.username)}
          onFocus={() => setFocusedField('username')}
          onBlur={() => setFocusedField(null)}
        />
      </Field>

      <Field
        label="Contraseña"
        icon={<FiLock size={16} />}
        error={formState.errors.password?.message}
        hasValue={!!passwordVal}
      >
        <input
          {...register('password')}
          type={showPassword ? 'text' : 'password'}
          placeholder="Tu contraseña"
          autoComplete="current-password"
          style={inputStyle('password', !!passwordVal, !!formState.errors.password)}
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField(null)}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
          style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: showPassword ? '#1a338e' : '#9ca3af',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 180ms',
          }}
        >
          {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
      </Field>

      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              background: '#fef2f2',
              border: '1.5px solid #fecaca',
              borderRadius: '12px',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '0.85rem',
              color: '#b91c1c',
              lineHeight: 1.45,
            }}
          >
            <FiAlertCircle size={17} style={{ flexShrink: 0, marginTop: '1px' }} />
            {serverError}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="submit"
        disabled={formState.isSubmitting}
        whileHover={!formState.isSubmitting ? { scale: 1.012, filter: 'brightness(1.06)' } : {}}
        whileTap={!formState.isSubmitting ? { scale: 0.988 } : {}}
        style={{
          width: '100%',
          padding: '13px 24px',
          background: formState.isSubmitting
            ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
            : 'linear-gradient(135deg, #0d1f6b 0%, #1a338e 55%, #2248b3 100%)',
          border: 'none',
          borderRadius: '12px',
          color: 'white',
          fontFamily: "'Sora', sans-serif",
          fontSize: '0.92rem',
          fontWeight: 700,
          cursor: formState.isSubmitting ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '9px',
          boxShadow: formState.isSubmitting
            ? 'none'
            : '0 6px 20px rgba(13,31,107,0.35), 0 2px 8px rgba(13,31,107,0.2)',
          transition: 'background 250ms, box-shadow 250ms',
          letterSpacing: '0.01em',
          marginTop: '2px',
        }}
      >
        {formState.isSubmitting ? (
          <>
            <svg
              style={{ animation: 'spin 0.8s linear infinite' }}
              width="17" height="17" fill="none" viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" opacity="0.25" />
              <path fill="white" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Verificando...
          </>
        ) : (
          <>
            <FiLogIn size={17} />
            Ingresar al sistema
          </>
        )}
      </motion.button>
    </motion.form>
  );
}
