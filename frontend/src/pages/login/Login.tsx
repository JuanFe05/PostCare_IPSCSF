import LoginForm from './LoginForm';
import logoIPS from "../../assets/IPS.png";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Imagen de fondo médica de alta calidad */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2080&auto=format&fit=crop')`,
        }}
      />
      
      {/* Overlay oscuro con ligero tono azul */}
      <div className="absolute inset-0" style={{ background: 'rgba(21, 33, 86, 0.55)' }} />
      
      {/* Contenido */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header con logo */}
          <div className="px-8 py-10 text-center" style={{ backgroundColor: '#1a338e' }}>
            <div className="inline-block bg-white rounded-3xl p-3 shadow-lg mb-4">
              <img src={logoIPS} alt="Logo IPS" className="h-20 w-20" />
            </div>
            <h1 className="text-white text-2xl font-bold">IPS Clínica Salud Florida</h1>
            <p className="text-blue-100 text-sm mt-2">Sistema de Gestión</p>
          </div>

          {/* Formulario */}
          <div className="px-8 py-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Iniciar Sesión</h2>
            <p className="text-gray-500 text-sm text-center mb-8">Ingresa tus credenciales para continuar</p>
            <LoginForm />
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 text-center border-t">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} IPS Clínica Salud Florida. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
