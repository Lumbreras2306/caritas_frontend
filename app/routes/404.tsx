import { Link } from 'react-router';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-red-600 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-white mb-4">
            Página no encontrada
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-md mx-auto">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <HomeIcon className="w-5 h-5" />
            <span>Ir al Inicio</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Volver Atrás</span>
          </button>
        </div>

        <div className="mt-12">
          <div className="card max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
              ¿Necesitas ayuda?
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Si crees que esto es un error, contacta al administrador del sistema.
            </p>
            <Link
              to="/dashboard"
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Ir al Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
