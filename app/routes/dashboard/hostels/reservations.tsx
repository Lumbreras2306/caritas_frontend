import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { hostelsService } from '~/lib/api';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { 
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface HostelReservation {
  id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  hostel: {
    id: string;
    name: string;
  };
  check_in_date: string;
  check_out_date: string;
  gender: 'M' | 'F';
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  created_at: string;
  updated_at: string;
}

export default function HostelReservations() {
  const [searchParams] = useSearchParams();
  const [reservations, setReservations] = useState<HostelReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'>('all');
  const [hostelFilter, setHostelFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const [hostels, setHostels] = useState<any[]>([]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = { 
        search: searchTerm,
        page: currentPage,
        page_size: 12
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (hostelFilter) {
        params.hostel = hostelFilter;
      }
      
      // Si hay un hostel específico en los parámetros de URL
      const hostelParam = searchParams.get('hostel');
      if (hostelParam) {
        params.hostel = hostelParam;
      }
      
      const response = await hostelsService.getReservations(params);
      setReservations(response.data.results);
      setTotalCount(response.data.count);
    } catch (error: any) {
      console.error('Error loading reservations:', error);
      setError('Error al cargar las reservas. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const loadHostels = async () => {
    try {
      const response = await hostelsService.getHostels({ page_size: 100 });
      setHostels(response.data.results);
    } catch (error: any) {
      console.error('Error loading hostels:', error);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [searchTerm, statusFilter, hostelFilter, currentPage, searchParams]);

  useEffect(() => {
    loadHostels();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await hostelsService.updateReservation(id, { status: newStatus });
      loadReservations();
    } catch (error: any) {
      console.error('Error updating reservation status:', error);
      alert('Error al actualizar el estado de la reserva. Intente nuevamente.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta reserva?')) return;
    
    try {
      await hostelsService.deleteReservation(id);
      loadReservations();
    } catch (error: any) {
      console.error('Error deleting reservation:', error);
      alert('Error al eliminar la reserva. Intente nuevamente.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-600';
      case 'CONFIRMED': return 'bg-green-600';
      case 'CANCELLED': return 'bg-red-600';
      case 'COMPLETED': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'CONFIRMED': return 'Confirmada';
      case 'CANCELLED': return 'Cancelada';
      case 'COMPLETED': return 'Completada';
      default: return status;
    }
  };

  const totalPages = Math.ceil(totalCount / 12);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Reservas de Albergues</h1>
          <p className="text-gray-300 mt-1">
            {totalCount} reserva{totalCount !== 1 ? 's' : ''} encontrada{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/dashboard/hostels/reservations/new" className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Nueva Reserva
        </Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Barra de búsqueda y filtros */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre de usuario o albergue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary flex items-center gap-2"
          >
            <FunnelIcon className="w-5 h-5" />
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className="card">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="input-field"
                >
                  <option value="all">Todos</option>
                  <option value="PENDING">Pendientes</option>
                  <option value="CONFIRMED">Confirmadas</option>
                  <option value="CANCELLED">Canceladas</option>
                  <option value="COMPLETED">Completadas</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Albergue</label>
                <select
                  value={hostelFilter}
                  onChange={(e) => setHostelFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="">Todos los albergues</option>
                  {hostels.map((hostel) => (
                    <option key={hostel.id} value={hostel.id}>
                      {hostel.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de reservas */}
      <div className="space-y-4">
        {reservations.map((reservation) => (
          <div key={reservation.id} className="card hover:shadow-xl transition-all duration-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <BuildingOfficeIcon className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">
                    {reservation.user.first_name} {reservation.user.last_name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusColor(reservation.status)}`}>
                    {getStatusText(reservation.status)}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                  <div>
                    <p><strong>Albergue:</strong> {reservation.hostel.name}</p>
                    <p><strong>Teléfono:</strong> {reservation.user.phone_number}</p>
                  </div>
                  <div>
                    <p><strong>Check-in:</strong> {new Date(reservation.check_in_date).toLocaleDateString()}</p>
                    <p><strong>Check-out:</strong> {new Date(reservation.check_out_date).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <UserGroupIcon className="w-4 h-4" />
                    {reservation.gender === 'M' ? 'Hombre' : 'Mujer'}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDaysIcon className="w-4 h-4" />
                    Creada: {new Date(reservation.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  to={`/dashboard/hostels/reservations/detail/${reservation.id}`}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <EyeIcon className="w-4 h-4" />
                  Ver
                </Link>
                
                {reservation.status === 'PENDING' && (
                  <button
                    onClick={() => handleStatusChange(reservation.id, 'CONFIRMED')}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Confirmar
                  </button>
                )}
                
                {reservation.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleStatusChange(reservation.id, 'COMPLETED')}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <ClockIcon className="w-4 h-4" />
                    Completar
                  </button>
                )}
                
                {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                  <button
                    onClick={() => handleStatusChange(reservation.id, 'CANCELLED')}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    Cancelar
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(reservation.id)}
                  className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  title="Eliminar reserva"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reservations.length === 0 && !loading && (
        <div className="text-center py-12">
          <CalendarDaysIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No se encontraron reservas</p>
          <p className="text-gray-500 text-sm mt-2">
            {searchTerm || statusFilter !== 'all' || hostelFilter
              ? 'Intenta ajustar los filtros de búsqueda' 
              : 'Comienza creando tu primera reserva'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && !hostelFilter && (
            <Link to="/dashboard/hostels/reservations/new" className="btn-primary mt-4 inline-flex items-center gap-2">
              <PlusIcon className="w-5 h-5" />
              Crear Primera Reserva
            </Link>
          )}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
            >
              Anterior
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
