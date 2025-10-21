import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { hostelsService } from '~/lib/api';
import { formatDate } from '~/lib/utils';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import NewReservationModal from '~/components/modals/NewReservationModal';
import EditReservationModal from '~/components/modals/EditReservationModal';
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
  user: string; // UUID del usuario
  user_name: string;
  user_phone: string;
  hostel: string; // UUID del albergue
  hostel_name: string;
  hostel_location: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected' | 'checked_in' | 'checked_out';
  status_display: string;
  type: 'individual' | 'group';
  type_display: string;
  arrival_date: string; // Fecha de llegada (formato date)
  men_quantity?: number;
  women_quantity?: number;
  total_people: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export default function HostelReservations() {
  const [searchParams] = useSearchParams();
  const [reservations, setReservations] = useState<HostelReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'rejected' | 'checked_in' | 'checked_out'>('all');
  const [hostelFilter, setHostelFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const [hostels, setHostels] = useState<any[]>([]);
  
  // Modal states
  const [newReservationModalOpen, setNewReservationModalOpen] = useState(false);
  const [editReservationModalOpen, setEditReservationModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<HostelReservation | null>(null);

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
      await hostelsService.updateReservationStatus(id, newStatus);
      loadReservations();
    } catch (error: any) {
      console.error('Error updating reservation status:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error al cambiar el estado de la reserva. Intente nuevamente.';
      alert(errorMessage);
    }
  };

  const handleEditReservation = (reservation: HostelReservation) => {
    setEditingReservation(reservation);
    setEditReservationModalOpen(true);
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
      case 'pending': return 'bg-yellow-600';
      case 'confirmed': return 'bg-green-600';
      case 'cancelled': return 'bg-red-600';
      case 'rejected': return 'bg-red-600';
      case 'checked_in': return 'bg-blue-600';
      case 'checked_out': return 'bg-gray-600';
      default: return 'bg-gray-600';
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
        <button 
          onClick={() => setNewReservationModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Nueva Reserva
        </button>
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
              className="w-full py-3 pr-4 pl-14 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
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
                  <option value="pending">Pendientes</option>
                  <option value="confirmed">Confirmadas</option>
                  <option value="cancelled">Canceladas</option>
                  <option value="rejected">Rechazadas</option>
                  <option value="checked_in">Check-in</option>
                  <option value="checked_out">Check-out</option>
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
                    {reservation.user_name}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusColor(reservation.status)}`}>
                    {reservation.status_display}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                  <div>
                    <p><strong>Albergue:</strong> {reservation.hostel_name}</p>
                    <p><strong>Teléfono:</strong> {reservation.user_phone}</p>
                  </div>
                  <div>
                    <p><strong>Fecha de llegada:</strong> {formatDate(reservation.arrival_date)}</p>
                    <p><strong>Tipo:</strong> {reservation.type_display}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <UserGroupIcon className="w-4 h-4" />
                    {reservation.total_people} persona{reservation.total_people !== 1 ? 's' : ''}
                    {(() => {
                      const men = reservation.men_quantity || 0;
                      const women = reservation.women_quantity || 0;
                      
                      if (men > 0 || women > 0) {
                        const parts = [];
                        if (men > 0) {
                          parts.push(`${men} hombre${men !== 1 ? 's' : ''}`);
                        }
                        if (women > 0) {
                          parts.push(`${women} mujer${women !== 1 ? 'es' : ''}`);
                        }
                        return (
                          <span className="ml-2 text-gray-500">
                            ({parts.join(', ')})
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDaysIcon className="w-4 h-4" />
                    Creada: {formatDate(reservation.created_at)}
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
                
                <button
                  onClick={() => handleEditReservation(reservation)}
                  className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <PencilIcon className="w-4 h-4" />
                  Editar
                </button>
                
                {reservation.status === 'pending' && (
                  <button
                    onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircleIcon className="w-4 h-4" />
                    Confirmar
                  </button>
                )}
                
                {reservation.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusChange(reservation.id, 'checked_in')}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <ClockIcon className="w-4 h-4" />
                    Check-in
                  </button>
                )}
                
                {reservation.status === 'checked_in' && (
                  <button
                    onClick={() => handleStatusChange(reservation.id, 'checked_out')}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <ClockIcon className="w-4 h-4" />
                    Check-out
                  </button>
                )}
                
                {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                  <button
                    onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                    className="btn-danger px-3 py-2 flex items-center justify-center gap-1"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    Cancelar
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(reservation.id)}
                  className="btn-danger px-3 py-2"
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
              className="btn-secondary disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
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
              className="btn-secondary disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal de Nueva Reserva */}
      <NewReservationModal
        isOpen={newReservationModalOpen}
        onClose={() => setNewReservationModalOpen(false)}
        onReservationCreated={() => {
          loadReservations();
          setNewReservationModalOpen(false);
        }}
      />

      {/* Modal de Editar Reserva */}
      <EditReservationModal
        isOpen={editReservationModalOpen}
        onClose={() => {
          setEditReservationModalOpen(false);
          setEditingReservation(null);
        }}
        onReservationUpdated={() => {
          loadReservations();
          setEditReservationModalOpen(false);
          setEditingReservation(null);
        }}
        reservation={editingReservation}
      />
    </div>
  );
}
