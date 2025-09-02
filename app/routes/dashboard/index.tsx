import { Link } from 'react-router';
import { useAuth } from '~/lib/auth';
import { BuildingOfficeIcon, WrenchScrewdriverIcon, ArchiveBoxIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { user } = useAuth();

  const quickActions = [
    {
      name: 'Albergues',
      description: 'Gestionar albergues y ubicaciones',
      href: '/dashboard/hostels',
      icon: BuildingOfficeIcon,
      color: 'bg-blue-600',
    },
    {
      name: 'Usuarios',
      description: 'Administrar usuarios del sistema',
      href: '/dashboard/users',
      icon: UserGroupIcon,
      color: 'bg-red-600',
    },
    {
      name: 'Servicios',
      description: 'Controlar servicios y reservas',
      href: '/dashboard/services',
      icon: WrenchScrewdriverIcon,
      color: 'bg-yellow-600',
    },
    {
      name: 'Inventario',
      description: 'Supervisar stock y artículos',
      href: '/dashboard/inventory',
      icon: ArchiveBoxIcon,
      color: 'bg-purple-600',
    },
  ];

  return (
    <div className="px-4 sm:px-0">
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            ¡Bienvenido, {user?.full_name || user?.username}!
          </h1>
          <p className="mt-2 text-gray-300">
            Panel de administración del sistema Cáritas de Monterrey
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                to={action.href}
                className="card hover:shadow-2xl transform hover:scale-105 transition-all duration-200 animate-slide-in hover:border-gray-600"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {action.name}
                </h3>
                <p className="text-gray-300 text-sm">
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">
              Estado del Sistema
            </h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Sistema funcionando correctamente
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                Base de datos conectada
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                API funcionando
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">
              Enlaces Rápidos
            </h3>
            <div className="space-y-2">
              <a
                href="http://localhost:8000/swagger/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-red-400 hover:text-red-300 text-sm transition-colors"
              >
                📖 Documentación API
              </a>
              <a
                href="http://localhost:8000/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-red-400 hover:text-red-300 text-sm transition-colors"
              >
                🖥️ Backend Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}