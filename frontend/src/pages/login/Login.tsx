import LoginForm from './LoginForm';

export default function Login() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      
      {/* Formulario a la izquierda */}
      <div className="flex flex-col justify-center items-center bg-white p-8 md:p-16">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2 text-center">Iniciar Sesión</h2>
          <LoginForm />
        </div>
      </div>

      {/* Fondo azul con imagen médica como marca de agua */}
      <div className="hidden md:block relative bg-blue-900">
        {/* Imagen como marca de agua */}
        <img
          src="/doctor.jpg"
          alt="Médico IPS"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
       <div className="relative z-10 flex flex-col justify-center items-center text-white p-8 text-center h-full">
          <h1 className="text-4xl font-bold">Sistema de Seguimiento Clínico IPSCSF</h1>
          <p className="text-sm mt-2 opacity-90">Acceso solo para el personal autorizado</p>
        </div>
      </div>

    </div>
  );
}
