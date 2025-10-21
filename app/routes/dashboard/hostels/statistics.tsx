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
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface Statistics {
  totalHostels: number;
  activeHostels: number;
  inactiveHostels: number;
  totalCapacity: number;
  totalMenCapacity: number;
  totalWomenCapacity: number;
  totalReservations: number;
  pendingReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  checkedInReservations: number;
  checkedOutReservations: number;
  todayReservations: number;
  thisWeekReservations: number;
  thisMonthReservations: number;
}

export default function HostelStatistics() {
  const [stats, setStats] = useState<Statistics>({
    totalHostels: 0,
    activeHostels: 0,
    inactiveHostels: 0,
    totalCapacity: 0,
    totalMenCapacity: 0,
    totalWomenCapacity: 0,
    totalReservations: 0,
    pendingReservations: 0,
    confirmedReservations: 0,
    cancelledReservations: 0,
    checkedInReservations: 0,
    checkedOutReservations: 0,
    todayReservations: 0,
    thisWeekReservations: 0,
    thisMonthReservations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar datos de albergues y reservas
      const [hostelsResponse, reservationsResponse] = await Promise.all([
        hostelsService.getHostels({ page_size: 1000 }),
        hostelsService.getReservations({ page_size: 1000 })
      ]);
      
      const hostels = hostelsResponse.data?.results || [];
      const reservations = reservationsResponse.data?.results || [];
      
      // Calcular estadísticas de albergues
      const totalHostels = hostels.length;
      const activeHostels = hostels.filter(h => h.is_active).length;
      const inactiveHostels = totalHostels - activeHostels;
      const totalCapacity = hostels.reduce((sum, h) => sum + (h.men_capacity || 0) + (h.women_capacity || 0), 0);
      const totalMenCapacity = hostels.reduce((sum, h) => sum + (h.men_capacity || 0), 0);
      const totalWomenCapacity = hostels.reduce((sum, h) => sum + (h.women_capacity || 0), 0);
      
      // Calcular estadísticas de reservas
      const totalReservations = reservations.length;
      const pendingReservations = reservations.filter((r: any) => r.status === 'pending').length;
      const confirmedReservations = reservations.filter((r: any) => r.status === 'confirmed').length;
      const cancelledReservations = reservations.filter((r: any) => r.status === 'cancelled').length;
      const checkedInReservations = reservations.filter((r: any) => r.status === 'checked_in').length;
      const checkedOutReservations = reservations.filter((r: any) => r.status === 'checked_out').length;
      
      // Calcular reservas por período
      const today = new Date().toISOString().split('T')[0];
      const todayReservations = reservations.filter((r: any) => {
        if (!r) return false;
        const arrivalDate = r.arrival_date;
        return arrivalDate && typeof arrivalDate === 'string' && arrivalDate.startsWith(today);
      }).length;
      
      // Esta semana (últimos 7 días)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const thisWeekReservations = reservations.filter((r: any) => {
        if (!r) return false;
        const arrivalDate = r.arrival_date;
        if (!arrivalDate || typeof arrivalDate !== 'string') return false;
        const reservationDate = new Date(arrivalDate);
        return reservationDate >= weekAgo;
      }).length;
      
      // Este mes
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const thisMonthReservations = reservations.filter((r: any) => {
        if (!r) return false;
        const arrivalDate = r.arrival_date;
        if (!arrivalDate || typeof arrivalDate !== 'string') return false;
        const reservationDate = new Date(arrivalDate);
        return reservationDate >= monthAgo;
      }).length;
      
      setStats({
        totalHostels,
        activeHostels,
        inactiveHostels,
        totalCapacity,
        totalMenCapacity,
        totalWomenCapacity,
        totalReservations,
        pendingReservations,
        confirmedReservations,
        cancelledReservations,
        checkedInReservations,
        checkedOutReservations,
        todayReservations,
        thisWeekReservations,
        thisMonthReservations
      });
    } catch (error: any) {
      console.error('Error loading statistics:', error);
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/hostels"
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Estadísticas de Albergues</h1>
            <p className="text-gray-400">Reportes y métricas del sistema</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-600 rounded-lg">
            <ChartBarIcon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={loadStatistics}
            className="ml-4 btn-primary px-3 py-1 text-sm"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Estadísticas de Albergues */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <BuildingOfficeIcon className="w-6 h-6 text-blue-400" />
          Estadísticas de Albergues
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Albergues</p>
                <p className="text-2xl font-bold text-white">{stats.totalHostels}</p>
              </div>
              <BuildingOfficeIcon className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Albergues Activos</p>
                <p className="text-2xl font-bold text-green-400">{stats.activeHostels}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Albergues Inactivos</p>
                <p className="text-2xl font-bold text-red-400">{stats.inactiveHostels}</p>
              </div>
              <XCircleIcon className="w-8 h-8 text-red-400" />
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Capacidad Total</p>
                <p className="text-2xl font-bold text-purple-400">{stats.totalCapacity}</p>
              </div>
              <UserGroupIcon className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Capacidad Hombres</p>
                <p className="text-xl font-bold text-blue-400">{stats.totalMenCapacity}</p>
              </div>
              <UserGroupIcon className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Capacidad Mujeres</p>
                <p className="text-xl font-bold text-pink-400">{stats.totalWomenCapacity}</p>
              </div>
              <UserGroupIcon className="w-6 h-6 text-pink-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas de Reservas */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <CalendarDaysIcon className="w-6 h-6 text-green-400" />
          Estadísticas de Reservas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Reservas</p>
                <p className="text-2xl font-bold text-white">{stats.totalReservations}</p>
              </div>
              <CalendarDaysIcon className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pendingReservations}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Confirmadas</p>
                <p className="text-2xl font-bold text-green-400">{stats.confirmedReservations}</p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Check-in</p>
                <p className="text-2xl font-bold text-blue-400">{stats.checkedInReservations}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Check-out</p>
                <p className="text-2xl font-bold text-gray-400">{stats.checkedOutReservations}</p>
              </div>
              <ClockIcon className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Canceladas</p>
                <p className="text-2xl font-bold text-red-400">{stats.cancelledReservations}</p>
              </div>
              <XCircleIcon className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas por Período */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6 text-purple-400" />
          Reservas por Período
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Hoy</p>
                <p className="text-2xl font-bold text-orange-400">{stats.todayReservations}</p>
              </div>
              <CalendarDaysIcon className="w-8 h-8 text-orange-400" />
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Esta Semana</p>
                <p className="text-2xl font-bold text-blue-400">{stats.thisWeekReservations}</p>
              </div>
              <CalendarDaysIcon className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Este Mes</p>
                <p className="text-2xl font-bold text-purple-400">{stats.thisMonthReservations}</p>
              </div>
              <CalendarDaysIcon className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/dashboard/hostels"
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Volver a Albergues
        </Link>
        
        <Link
          to="/dashboard/hostels/reservations"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center justify-center gap-2"
        >
          <CalendarDaysIcon className="w-4 h-4" />
          Ver Reservas
        </Link>
        
        <Link
          to="/dashboard/hostels/list"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center justify-center gap-2"
        >
          <BuildingOfficeIcon className="w-4 h-4" />
          Gestionar Albergues
        </Link>
      </div>
    </div>
  );
}
