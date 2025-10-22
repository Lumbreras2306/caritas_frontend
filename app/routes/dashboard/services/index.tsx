import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { servicesService } from '~/lib/api';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { 
  CogIcon, 
  CalendarDaysIcon, 
  BuildingOfficeIcon,
  PlusIcon,
  ListBulletIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface ServiceStats {
  services: {
    total_services: number;
    active_services: number;
    inactive_services: number;
    needs_approval_count: number;
    auto_approval_count: number;
  };
  pricing: {
    avg_price: number;
    min_price: number;
    max_price: number;
  };
  by_reservation_type: Array<{
    reservation_type: string;
    count: number;
  }>;
  reservations: {
    total_reservations: number;
    by_status: Array<{
      status: string;
      count: number;
    }>;
  };
}

export default function Services() {
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Loading service statistics...');
      const response = await servicesService.getStatistics();
      console.log('✅ Service statistics loaded:', response.data);
      setStats(response.data);
    } catch (error: any) {
      console.error('❌ Error loading service stats:', error);
      console.error('📊 Error response:', error.response?.data);
      console.error('🔍 Error status:', error.response?.status);
      setError(`Error al cargar las estadísticas de servicios: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

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
            Servicios
          </h1>
          <p className="mt-2 text-gray-300">
            Gestionar servicios, reservas y horarios del sistema
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Estadísticas */}
        {(stats || error) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <CogIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-300">Total Servicios</p>
                  <p className="text-2xl font-bold text-white">{stats?.services?.total_services || 0}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-green-600 rounded-lg">
                  <CogIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-300">Servicios Activos</p>
                  <p className="text-2xl font-bold text-white">{stats?.services?.active_services || 0}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-orange-600 rounded-lg">
                  <CalendarDaysIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-300">Total Reservas</p>
                  <p className="text-2xl font-bold text-white">{stats?.reservations?.total_reservations || 0}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-600 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-300">Servicios Inactivos</p>
                  <p className="text-2xl font-bold text-white">{stats?.services?.inactive_services || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas adicionales */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-600 rounded-lg">
                  <CogIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-300">Requieren Aprobación</p>
                  <p className="text-2xl font-bold text-white">{stats.services?.needs_approval_count || 0}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <div className="p-3 bg-teal-600 rounded-lg">
                  <ClockIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-300">Aprobación Automática</p>
                  <p className="text-2xl font-bold text-white">{stats.services?.auto_approval_count || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Acciones principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link to="/dashboard/services/list" className="card hover:shadow-lg transition-shadow group">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                <ListBulletIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">Gestionar Servicios</h3>
                <p className="text-gray-400 text-sm">Ver, crear y editar servicios</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Administra todos los servicios disponibles en el sistema
            </p>
          </Link>

          <Link to="/dashboard/services/reservations" className="card hover:shadow-lg transition-shadow group">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-orange-600 rounded-lg group-hover:bg-orange-700 transition-colors">
                <CalendarDaysIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">Reservas</h3>
                <p className="text-gray-400 text-sm">Gestionar reservas de servicios</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Revisa y administra las reservas de servicios
            </p>
          </Link>

          <Link to="/dashboard/services/hostel-services" className="card hover:shadow-lg transition-shadow group">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-600 rounded-lg group-hover:bg-green-700 transition-colors">
                <BuildingOfficeIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">Servicios por Albergue</h3>
                <p className="text-gray-400 text-sm">Asignar servicios a albergues</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Configura qué servicios están disponibles en cada albergue
            </p>
          </Link>
        </div>

        {/* Acciones rápidas */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h3>
          <div className="flex flex-wrap gap-4">
            <Link to="/dashboard/services/new" className="btn-primary flex items-center gap-2">
              <PlusIcon className="w-5 h-5" />
              Nuevo Servicio
            </Link>
            <Link to="/dashboard/services/list" className="btn-secondary flex items-center gap-2">
              <ListBulletIcon className="w-5 h-5" />
              Ver Todos los Servicios
            </Link>
            <Link to="/dashboard/services/reservations" className="btn-secondary flex items-center gap-2">
              <CalendarDaysIcon className="w-5 h-5" />
              Ver Reservas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
