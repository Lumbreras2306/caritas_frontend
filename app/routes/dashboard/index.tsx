import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '~/lib/auth';
import { usersService, hostelsService, servicesService, inventoryService } from '~/lib/api';
import { BuildingOfficeIcon, WrenchScrewdriverIcon, ArchiveBoxIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '~/components/ui/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    admins: 0,
    customers: 0,
    preRegisters: 0,
    hostels: 0,
    services: 0,
    inventoryItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [adminsRes, customersRes, preRegistersRes, hostelsRes, servicesRes, inventoryRes] = await Promise.all([
          usersService.getAdmins({ page_size: 1 }),
          usersService.getCustomers({ page_size: 1 }),
          usersService.getPreRegisters({ page_size: 1, status: 'PENDING' }),
          hostelsService.getHostels({ page_size: 1 }),
          servicesService.getServices({ page_size: 1 }),
          inventoryService.getItems({ page_size: 1 }),
        ]);

        setStats({
          admins: adminsRes.data.count,
          customers: customersRes.data.count,
          preRegisters: preRegistersRes.data.count,
          hostels: hostelsRes.data.count,
          services: servicesRes.data.count,
          inventoryItems: inventoryRes.data.count,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const quickActions = [
    {
      name: 'Albergues',
      description: 'Gestionar albergues y ubicaciones',
      href: '/dashboard/hostels',
      icon: BuildingOfficeIcon,
      color: 'bg-blue-600',
      count: stats.hostels,
    },
    {
      name: 'Usuarios',
      description: 'Administrar usuarios del sistema',
      href: '/dashboard/users',
      icon: UserGroupIcon,
      color: 'bg-red-600',
      count: stats.customers,
    },
    {
      name: 'Servicios',
      description: 'Controlar servicios y reservas',
      href: '/dashboard/services',
      icon: WrenchScrewdriverIcon,
      color: 'bg-yellow-600',
      count: stats.services,
    },
    {
      name: 'Inventario',
      description: 'Supervisar stock y artículos',
      href: '/dashboard/inventory',
      icon: ArchiveBoxIcon,
      color: 'bg-purple-600',
      count: stats.inventoryItems,
    },
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
            ¡Bienvenido, {user?.full_name || user?.username}!
          </h1>
          <p className="mt-2 text-gray-300">
            Sistema de administración Cáritas de Monterrey
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
                <p className="text-gray-300 text-sm mb-3">
                  {action.description}
                </p>
                <div className="text-3xl font-bold text-white">
                  {action.count}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">
              📝 Pre-registros Pendientes
            </h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-2">
                {stats.preRegisters}
              </div>
              <Link
                to="/dashboard/users/preregisters"
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Ver pre-registros →
              </Link>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">
              📊 Total de Usuarios
            </h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">
                {stats.customers + stats.admins}
              </div>
              <p className="text-gray-400 text-sm">
                Usuarios finales + Administradores
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}