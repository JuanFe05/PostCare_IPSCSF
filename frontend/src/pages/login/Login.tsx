import LoginForm from './LoginForm';
import logoIPS from "../../assets/IPS.png";

export default function Login() {
  return (
    <div className="min-h-screen flex overflow-hidden" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      
      {/* Panel izquierdo — imagen + branding */}
      <div
        className="hidden lg:flex flex-col justify-between relative overflow-hidden"
        style={{ width: '52%', flexShrink: 0 }}
      >
        {/* Imagen de fondo */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop')`,
          }}
        />
        {/* Overlay degradado */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(155deg, rgba(13,31,107,0.85) 0%, rgba(26,51,142,0.72) 50%, rgba(14,22,64,0.88) 100%)',
          }}
        />

        {/* Contenido encima del overlay */}
        <div className="relative z-10 flex flex-col h-full p-12 justify-between">
          {/* Logo top-left */}
          <div className="flex items-center gap-3 animate-fade-in">
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.95)', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
            >
              <img src={logoIPS} alt="Logo IPS" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Sora', sans-serif", color: 'white', fontSize: '1rem', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
                IPS Clínica
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(147,174,245,0.9)', fontSize: '0.78rem', margin: 0 }}>
                Salud Florida
              </p>
            </div>
          </div>

          {/* Texto central */}
          <div className="animate-fade-in-up stagger-2">
            <div
              className="inline-block mb-5 px-4 py-2 rounded-full"
              style={{ background: 'rgba(14,165,233,0.18)', border: '1px solid rgba(14,165,233,0.3)' }}
            >
              <span style={{ fontFamily: "'DM Sans', sans-serif", color: '#7dd3fc', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Sistema de Gestión Médica
              </span>
            </div>
            <h1
              style={{
                fontFamily: "'Sora', sans-serif",
                color: 'white',
                fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                fontWeight: 800,
                lineHeight: 1.18,
                margin: '0 0 1.2rem',
                letterSpacing: '-0.02em',
              }}
            >
              Bienvenido al<br />
              <span style={{ color: '#7dd3fc' }}>PostCare</span> IPSCSF
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(203,213,250,0.8)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '380px', margin: 0 }}>
              Gestión integral de atenciones, pacientes y seguimientos clínicos para el equipo de salud.
            </p>
          </div>

          {/* Footer izquierdo */}
          <div className="animate-fade-in stagger-4">
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(147,174,245,0.55)', fontSize: '0.75rem', margin: 0 }}>
              © {new Date().getFullYear()} IPS Clínica Salud Florida · Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div
        className="flex flex-1 flex-col items-center justify-center"
        style={{ background: '#f0f4f9', padding: '2rem 1.5rem' }}
      >
        <div
          className="w-full animate-scale-in"
          style={{ maxWidth: '420px' }}
        >
          {/* Logo visible solo en mobile */}
          <div className="flex lg:hidden items-center gap-3 justify-center mb-8">
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{ width: '44px', height: '44px', background: '#1a338e', boxShadow: '0 4px 16px rgba(26,51,142,0.4)' }}
            >
              <img src={logoIPS} alt="Logo IPS" style={{ width: '28px', height: '28px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Sora', sans-serif", color: '#0d1f6b', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                IPS Clínica Salud Florida
              </p>
              <p style={{ color: '#94a3b8', fontSize: '0.72rem', margin: 0 }}>Sistema de Gestión</p>
            </div>
          </div>

          {/* Tarjeta de login */}
          <div
            style={{
              background: 'white',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(13,31,107,0.1), 0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid rgba(226,232,240,0.8)',
              overflow: 'hidden',
            }}
          >
            {/* Header de la tarjeta */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0d1f6b 0%, #1a338e 60%, #2248b3 100%)',
                padding: '2rem 2.5rem',
                textAlign: 'center',
              }}
            >
              <div
                className="inline-flex items-center justify-center mx-auto mb-4"
                style={{
                  width: '60px',
                  height: '60px',
                  background: 'rgba(255,255,255,0.12)',
                  borderRadius: '16px',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                }}
              >
                <i className="fas fa-lock" style={{ color: 'white', fontSize: '1.4rem' }} />
              </div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", color: 'white', fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.4rem', letterSpacing: '-0.01em' }}>
                Iniciar Sesión
              </h2>
              <p style={{ color: 'rgba(147,174,245,0.85)', fontSize: '0.85rem', margin: 0 }}>
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {/* Formulario */}
            <div style={{ padding: '2rem 2.5rem' }}>
              <LoginForm />
            </div>
          </div>

          {/* Footer mobile */}
          <p className="text-center lg:hidden mt-6" style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
            © {new Date().getFullYear()} IPS Clínica Salud Florida
          </p>
        </div>
      </div>
    </div>
  );
}
