import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '~/lib/auth';
import Button from '~/components/ui/Button';
import LoadingSpinner from '~/components/ui/LoadingSpinner';

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Si ya está autenticado, redirigir al dashboard
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.non_field_errors?.[0] || 
        err.response?.data?.detail || 
        'Error de conexión. Verifica que el backend esté funcionando.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo de Cáritas */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-600 rounded-full mb-4 shadow-2xl">
            <span className="text-white text-4xl font-bold">C</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Cáritas de Monterrey
          </h1>
          <p className="text-gray-300 text-sm">
            Sistema de Administración
          </p>
        </div>

        {/* Formulario de Login */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white text-center mb-6">
            Iniciar Sesión
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                placeholder="Ingresa tu usuario"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                placeholder="Ingresa tu contraseña"
                required
                disabled={loading}
              />
            </div>
            
            <Button
              type="submit"
              loading={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold"
              disabled={loading}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Acceso exclusivo para administradores
            </p>
            <Link 
              to="/register" 
              className="text-red-400 hover:text-red-300 text-sm mt-2 inline-block"
            >
              ¿Necesitas acceso? Pre-regístrate aquí
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-xs">
            © 2024 Cáritas de Monterrey. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}