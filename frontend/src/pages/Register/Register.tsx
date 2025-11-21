import RegisterForm from './RegisterForm';

export default function Register() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      
      {/* Formulario a la izquierda */}
      <div className="flex flex-col justify-center items-center bg-white p-8 md:p-16">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2 text-center">Crear cuenta</h2>
          <p className="text-sm text-gray-500 mb-6 text-center">Regístrate para acceder al sistema</p>
          <RegisterForm />
        </div>
      </div>

      {/* Imagen médica a la derecha */}
      <div className="hidden md:block relative">
        <img
          src="/doctor.jpg"
          alt="Médico IPS"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-blue-900 bg-opacity-60 flex flex-col justify-center items-center text-white p-8 text-center">
          <h1 className="text-4xl font-bold">Sistema Clínico IPSCSF</h1>
          <p className="text-sm mt-2 opacity-90">Acceso solo para el personal autorizado</p>
        </div>
      </div>

    </div>
  );
}