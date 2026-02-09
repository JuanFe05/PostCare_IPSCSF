import LoginForm from './LoginForm';
import logoIPS from "../../assets/IPS.png";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Imagen de fondo con doctores */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/doctor.jpg')`,
        }}
      />
      
      {/* Overlay azul con transparencia reducida */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/50 via-blue-500/45 to-blue-700/50" />
      
      {/* Contenido */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header con logo */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-10 text-center">
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
