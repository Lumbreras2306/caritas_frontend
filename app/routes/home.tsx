import { Link } from 'react-router';
import { ArrowRightIcon, HeartIcon, HomeIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const features = [
    {
      icon: HomeIcon,
      title: 'Gestión de Albergues',
      description: 'Administra albergues, ubicaciones y disponibilidad en tiempo real.',
    },
    {
      icon: UserGroupIcon,
      title: 'Control de Usuarios',
      description: 'Sistema completo de registro, pre-registro y gestión de usuarios.',
    },
    {
      icon: HeartIcon,
      title: 'Servicios Sociales',
      description: 'Organiza servicios comunitarios, horarios y reservas.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <span className="text-3xl font-bold text-primary-600">🏠 Caritas</span>
              <span className="ml-3 text-gray-600">Sistema de Gestión</span>
            </div>
            <Link
              to="/login"
              className="btn-primary animate-fade-in"
            >
              Iniciar Sesión
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center animate-fade-in">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Gestión de
            <span className="text-primary-600 animate-pulse-slow"> Albergues</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Sistema integral para la administración de albergues, servicios sociales, 
            inventario y usuarios de la organización Caritas.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn-primary text-lg px-8 py-4 animate-slide-in"
            >
              Pre-registrarse
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="btn-secondary text-lg px-8 py-4 animate-slide-in"
              style={{ animationDelay: '0.1s' }}
            >
              Acceso Administrativo
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Características Principales
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="card animate-fade-in hover:shadow-lg"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="text-primary-600 mb-4">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-white/60 backdrop-blur-sm rounded-2xl p-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="animate-bounce-soft">
              <div className="text-4xl font-bold text-primary-600">24/7</div>
              <div className="text-gray-600 mt-2">Disponibilidad</div>
            </div>
            <div className="animate-bounce-soft" style={{ animationDelay: '0.5s' }}>
              <div className="text-4xl font-bold text-primary-600">100%</div>
              <div className="text-gray-600 mt-2">Seguridad</div>
            </div>
            <div className="animate-bounce-soft" style={{ animationDelay: '1s' }}>
              <div className="text-4xl font-bold text-primary-600">∞</div>
              <div className="text-gray-600 mt-2">Capacidad</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Caritas - Sistema de Gestión de Albergues</p>
            <p className="mt-2">Desarrollado con ❤️ para ayudar a la comunidad</p>
          </div>
        </div>
      </footer>
    </div>
  );
}