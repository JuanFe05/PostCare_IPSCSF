import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();

  const handleAction = () => {
    if (auth?.user) {
      // Si está logueado, volver a la página anterior
      navigate(-1);
    } else {
      // Si no está logueado, redirigir al login
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center text-yellow-700 px-4">
      <h1 className="text-3xl font-bold mb-4">No autorizado</h1>
      <p className="text-lg mb-6">No tienes permisos para acceder a esta sección.</p>

      <button
        onClick={handleAction}
        className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        {auth?.user ? 'Volver' : 'Ir al Login'}
      </button>
    </div>
  );
};

export default UnauthorizedPage;
