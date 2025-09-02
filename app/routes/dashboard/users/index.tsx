import { Link } from 'react-router';
import { UserGroupIcon, UserPlusIcon, CogIcon } from '@heroicons/react/24/outline';

export default function UsersDashboard() {
  const userActions = [
    {
      name: 'Ver Usuarios',
      description: 'Lista de todos los usuarios del sistema',
      href: '/dashboard/users/list',
      icon: UserGroupIcon,
      color: 'bg-blue-600',
    },
    {
      name: 'Nuevo Usuario',
      description: 'Crear un nuevo usuario administrador',
      href: '/dashboard/users/new',
      icon: UserPlusIcon,
      color: 'bg-red-600',
    },
    {
      name: 'Configuración',
      description: 'Gestionar permisos y roles del sistema',
      href: '/dashboard/users/settings',
      icon: CogIcon,
      color: 'bg-purple-600',
    },
  ];

  return (
    <div className="px-4 sm:px-0">
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Gestión de Usuarios
          </h1>
          <p className="mt-2 text-gray-300">
            Administra usuarios administradores del sistema Cáritas
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {userActions.map((action, index) => {
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

        <div className="mt-12">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">
              Estadísticas de Usuarios
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">0</div>
                <div className="text-sm text-gray-300">Usuarios Activos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">0</div>
                <div className="text-sm text-gray-300">Administradores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">0</div>
                <div className="text-sm text-gray-300">Total Usuarios</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
