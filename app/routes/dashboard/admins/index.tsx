import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { adminUsersService } from '~/lib/api';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { 
  UserGroupIcon, 
  ShieldCheckIcon, 
  UserPlusIcon,
  UsersIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function Admins() {
  const [stats, setStats] = useState({
    totalAdmins: 0,
    activeAdmins: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar estadísticas de administradores
      const response = await adminUsersService.getAdminUsers({ page_size: 1000 });
      const admins = response.data?.results || [];
      
      // Calcular estadísticas
      const totalAdmins = admins.length;
      const activeAdmins = admins.filter(a => a.is_active).length;
      
      setStats({
        totalAdmins,
        activeAdmins
      });
    } catch (error: any) {
      console.error('Error loading stats:', error);
      setError('Error al cargar las estadísticas');
      // Establecer valores por defecto en caso de error
      setStats({
        totalAdmins: 0,
        activeAdmins: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const statsData = [
    {
      name: 'Total Administradores',
      value: stats.totalAdmins.toString(),
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      link: '/dashboard/admins/list'
    },
    {
      name: 'Administradores Activos',
      value: stats.activeAdmins.toString(),
      icon: ShieldCheckIcon,
      color: 'bg-green-500',
      link: '/dashboard/admins/list?status=active'
    }
  ];

  const quickActions = [
    {
      name: 'Ver Todos los Administradores',
      description: 'Gestionar cuentas de administradores',
      href: '/dashboard/admins/list',
      icon: UserGroupIcon,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Nuevo Administrador',
      description: 'Crear una nueva cuenta de administrador',
      href: '/dashboard/admins/new',
      icon: UserPlusIcon,
      color: 'bg-green-600 hover:bg-green-700'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Administradores
          </h1>
          <p className="mt-2 text-gray-300">
            Gestionar cuentas de administradores del sistema
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={loadStats}
              className="ml-4 btn-primary px-3 py-1 text-sm"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {statsData.map((stat) => (
            <div
              key={stat.name}
              className="card"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-300">{stat.name}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Acciones Rápidas */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className="card hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center mb-3">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white ml-3">{action.name}</h3>
                </div>
                <p className="text-gray-300 text-sm">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
