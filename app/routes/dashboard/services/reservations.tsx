import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { servicesService } from '~/lib/api';
import { formatDate } from '~/lib/utils';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import Button from '~/components/ui/Button';
import ConfirmationModal from '~/components/modals/ConfirmationModal';
import { 
  CalendarDaysIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  PlusIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface ServiceReservation {
  id: string;
  user: string;
  user_name: string;
  user_phone: string;
  service: string;
  service_name: string;
  service_price: string;
  hostel_name: string;
  datetime_reserved: string;
  end_datetime_reserved: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected' | 'completed' | 'in_progress';
  status_display: string;
  type: 'individual' | 'group';
  type_display: string;
  men_quantity: number;
  women_quantity: number;
  total_people: number;
  is_expired: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function ServiceReservations() {
  const [reservations, setReservations] = useState<ServiceReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'rejected' | 'completed' | 'in_progress'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: string | null;
    name: string;
  }>({
    isOpen: false,
    id: null,
    name: ''
  });
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = { 
        search: searchTerm,
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      if (dateFilter) {
        params.reservation_date = dateFilter;
      }
      
      const response = await servicesService.getReservations(params);
      setReservations(response.data.results || []);
    } catch (error: any) {
      console.error('Error loading reservations:', error);
      setError('Error al cargar las reservas de servicios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [searchTerm, statusFilter, dateFilter]);

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      id,
      name
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.id) return;
    
    try {
      setDeleting(true);
      await servicesService.deleteReservation(deleteModal.id);
      setDeleteModal({ isOpen: false, id: null, name: '' });
      loadReservations();
    } catch (error: any) {
      console.error('Error deleting reservation:', error);
      setError('Error al eliminar la reserva');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, id: null, name: '' });
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      setUpdating(true);
      await servicesService.updateReservation(id, { status });
      loadReservations();
    } catch (error: any) {
      console.error('Error updating reservation status:', error);
      setError('Error al actualizar el estado de la reserva');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-600 text-white';
      case 'confirmed':
        return 'bg-green-600 text-white';
      case 'rejected':
        return 'bg-red-600 text-white';
      case 'completed':
        return 'bg-blue-600 text-white';
      case 'cancelled':
        return 'bg-gray-600 text-white';
      case 'in_progress':
        return 'bg-orange-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmada';
      case 'rejected':
        return 'Rechazada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      case 'in_progress':
        return 'En Progreso';
      default:
        return status;
    }
  };

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return 'Nunca';
    try {
      const date = new Date(dateTime);
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

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
          <h1 className="text-3xl font-bold text-white">Reservas de Servicios</h1>
          <p className="text-gray-300 mt-1">
            {reservations.length} reserva{reservations.length !== 1 ? 's' : ''} encontrada{reservations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/dashboard/services/reservations/new" className="btn-primary flex items-center gap-2">
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
              placeholder="Buscar por usuario, servicio o albergue..."
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
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="rejected">Rechazada</option>
                  <option value="completed">Completada</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="in_progress">En Progreso</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fecha</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de reservas */}
      <div className="space-y-4">
        {reservations.map((reservation) => (
          <div key={reservation.id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex gap-4 flex-1">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                    <CalendarDaysIcon className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-white">{reservation.service_name}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(reservation.status)}`}>
                      {getStatusText(reservation.status)}
                    </span>
                    {reservation.is_expired && (
                      <span className="px-2 py-1 text-xs rounded bg-red-600 text-white">
                        Expirada
                      </span>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        <span>{reservation.user_name}</span>
                        {reservation.user_phone && (
                          <span className="text-gray-500">({reservation.user_phone})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
                        <span>{reservation.hostel_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Tipo:</span>
                        <span>{reservation.type_display}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                        <span>{formatDateTime(reservation.datetime_reserved)}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <ClockIcon className="w-4 h-4 text-gray-400" />
                        <span>{reservation.duration_minutes} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Personas:</span>
                        <span>{reservation.total_people} (H: {reservation.men_quantity}, M: {reservation.women_quantity})</span>
                      </div>
                    </div>
                  </div>

                  {reservation.notes && (
                    <div className="text-sm text-gray-400 mb-2">
                      <span className="font-medium">Notas:</span> {reservation.notes}
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    <p>Creada: {formatDate(reservation.created_at)}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  to={`/dashboard/services/reservations/detail/${reservation.id}`}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center justify-center gap-1 text-sm"
                >
                  <EyeIcon className="w-4 h-4" />
                  Ver
                </Link>
                
                {/* Dropdown de estados */}
                <div className="relative">
                  <select
                    value={reservation.status}
                    onChange={(e) => handleStatusUpdate(reservation.id, e.target.value)}
                    disabled={updating}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors text-sm disabled:opacity-50 appearance-none pr-8 min-w-0 w-auto max-w-32"
                  >
                    {/* Estado actual siempre visible */}
                    <option value={reservation.status}>
                      {getStatusText(reservation.status)}
                    </option>
                    
                    {/* Transiciones válidas según el estado actual */}
                    {reservation.status === 'pending' && (
                      <>
                        <option value="confirmed">Confirmada</option>
                        <option value="cancelled">Cancelada</option>
                        <option value="rejected">Rechazada</option>
                      </>
                    )}
                    
                    {reservation.status === 'confirmed' && (
                      <>
                        <option value="in_progress">En Progreso</option>
                        <option value="cancelled">Cancelada</option>
                      </>
                    )}
                    
                    {reservation.status === 'in_progress' && (
                      <>
                        <option value="completed">Completada</option>
                        <option value="cancelled">Cancelada</option>
                      </>
                    )}
                    
                    {/* Estados finales no tienen transiciones */}
                    {['completed', 'cancelled', 'rejected'].includes(reservation.status) && (
                      <option disabled>Sin transiciones disponibles</option>
                    )}
                  </select>
                  <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
                </div>
                
                <button
                  onClick={() => handleDeleteClick(reservation.id, `${reservation.user_name} - ${reservation.service_name}`)}
                  className="btn-danger px-3 py-2"
                  title="Eliminar reserva"
                >
                  <XCircleIcon className="w-4 h-4" />
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
            {searchTerm || statusFilter !== 'all' || dateFilter
              ? 'Intenta ajustar los filtros de búsqueda' 
              : 'No hay reservas de servicios registradas'
            }
          </p>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Reserva"
        message={`¿Está seguro de eliminar la reserva "${deleteModal.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}
