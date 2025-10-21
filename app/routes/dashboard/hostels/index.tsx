import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { hostelsService } from '~/lib/api';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  UserGroupIcon, 
  CalendarDaysIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export default function Hostels() {
  const [stats, setStats] = useState({
    totalHostels: 0,
    activeHostels: 0,
    totalCapacity: 0,
    todayReservations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar estadísticas de albergues
      const [hostelsResponse, reservationsResponse] = await Promise.all([
        hostelsService.getHostels({ page_size: 1000 }), // Obtener todos los albergues
        hostelsService.getReservations({ page_size: 1000 }) // Obtener todas las reservas
      ]);
      
      const hostels = hostelsResponse.data?.results || [];
      const reservations = reservationsResponse.data?.results || [];
      
      // Calcular estadísticas
      const totalHostels = hostels.length;
      const activeHostels = hostels.filter(h => h.is_active).length;
      const totalCapacity = hostels.reduce((sum, h) => sum + (h.men_capacity || 0) + (h.women_capacity || 0), 0);
      
      // Reservas de hoy - con validación adicional
      const today = new Date().toISOString().split('T')[0];
      const todayReservations = reservations.filter((r: any) => {
        if (!r) return false;
        const checkIn = r.check_in_date;
        const checkOut = r.check_out_date;
        return (checkIn && typeof checkIn === 'string' && checkIn.startsWith(today)) || 
               (checkOut && typeof checkOut === 'string' && checkOut.startsWith(today));
      }).length;
      
      setStats({
        totalHostels,
        activeHostels,
        totalCapacity,
        todayReservations
      });
    } catch (error: any) {
      console.error('Error loading stats:', error);
      setError('Error al cargar las estadísticas');
      // Establecer valores por defecto en caso de error
      setStats({
        totalHostels: 0,
        activeHostels: 0,
        totalCapacity: 0,
        todayReservations: 0
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
      name: 'Total Albergues',
      value: stats.totalHostels.toString(),
      icon: BuildingOfficeIcon,
      color: 'bg-blue-500',
      link: '/dashboard/hostels/list'
    },
    {
      name: 'Albergues Activos',
      value: stats.activeHostels.toString(),
      icon: MapPinIcon,
      color: 'bg-green-500',
      link: '/dashboard/hostels/list?status=active'
    },
    {
      name: 'Capacidad Total',
      value: stats.totalCapacity.toString(),
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      link: '/dashboard/hostels/list'
    },
    {
      name: 'Reservas Hoy',
      value: stats.todayReservations.toString(),
      icon: CalendarDaysIcon,
      color: 'bg-orange-500',
      link: '/dashboard/hostels/reservations'
    }
  ];

  const quickActions = [
    {
      name: 'Ver Todos los Albergues',
      description: 'Gestionar albergues existentes',
      href: '/dashboard/hostels/list',
      icon: BuildingOfficeIcon,
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Nuevo Albergue',
      description: 'Registrar un nuevo albergue',
      href: '/dashboard/hostels/new',
      icon: PlusIcon,
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      name: 'Reservas',
      description: 'Gestionar reservas de albergues',
      href: '/dashboard/hostels/reservations',
      icon: CalendarDaysIcon,
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      name: 'Estadísticas',
      description: 'Ver reportes y métricas',
      href: '/dashboard/hostels/statistics',
      icon: ChartBarIcon,
      color: 'bg-orange-600 hover:bg-orange-700'
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
            Albergues
          </h1>
          <p className="mt-2 text-gray-300">
            Gestionar albergues, ubicaciones y reservas del sistema
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={loadStats}
              className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
