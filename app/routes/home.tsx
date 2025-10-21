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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ 
      background: 'linear-gradient(135deg, var(--caritas-bg-dark) 0%, var(--caritas-primary) 50%, var(--caritas-bg-dark) 100%)' 
    }}>
      <div className="w-full max-w-md">
        {/* Logo de Cáritas */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 shadow-2xl" style={{ backgroundColor: 'var(--caritas-primary)' }}>
            <img 
              src="/logo.png" 
              alt="Cáritas de Monterrey" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--caritas-text-primary)' }}>
            Cáritas de Monterrey
          </h1>
          <p className="text-sm" style={{ color: 'var(--caritas-text-secondary)' }}>
            Sistema de Administración
          </p>
        </div>

        {/* Formulario de Login */}
        <div className="rounded-2xl shadow-2xl p-8 border" style={{ 
          backgroundColor: 'var(--caritas-bg-card)', 
          borderColor: 'var(--caritas-border)' 
        }}>
          <h2 className="text-2xl font-semibold text-center mb-6" style={{ color: 'var(--caritas-text-primary)' }}>
            Iniciar Sesión
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="px-4 py-3 rounded-lg text-sm" style={{ 
                backgroundColor: 'var(--caritas-warm)', 
                borderColor: 'var(--caritas-warm)', 
                color: 'white' 
              }}>
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2" style={{ color: 'var(--caritas-text-secondary)' }}>
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg transition-all duration-200 input-caritas"
                placeholder="Ingresa tu usuario"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'var(--caritas-text-secondary)' }}>
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg transition-all duration-200 input-caritas"
                placeholder="Ingresa tu contraseña"
                required
                disabled={loading}
              />
            </div>
            
            <Button
              type="submit"
              loading={loading}
              className="w-full py-3 text-lg font-semibold btn-caritas-primary"
              disabled={loading}
            >
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'var(--caritas-text-secondary)' }}>
              Acceso exclusivo para administradores
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs" style={{ color: 'var(--caritas-text-muted)' }}>
            © 2025 Cáritas de Monterrey. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}