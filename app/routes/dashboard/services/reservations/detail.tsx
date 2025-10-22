import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { servicesService } from '~/lib/api';
import { formatDate, formatDateTime } from '~/lib/utils';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import Button from '~/components/ui/Button';
import ConfirmationModal from '~/components/modals/ConfirmationModal';
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface ServiceReservation {
  id: string;
  user: string;
  user_data: {
    id: string;
    full_name: string;
    phone_number: string;
  };
  service: string;
  service_data: {
    id: string;
    hostel: string;
    hostel_name: string;
    hostel_location: string;
    service: string;
    service_name: string;
    service_description: string;
    service_price: string;
    service_max_time: number;
    service_needs_approval: boolean;
    schedule: string;
    schedule_data: {
      id: string;
      day_of_week: number;
      day_name: string;
      start_time: string;
      end_time: string;
      duration_hours: number;
      is_available: boolean;
      created_by_name: string;
      created_at: string;
      updated_at: string;
    };
    is_active: boolean;
    total_reservations: number;
    created_by_name: string;
    created_at: string;
    updated_at: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected' | 'completed' | 'in_progress';
  status_display: string;
  type: 'individual' | 'group';
  type_display: string;
  men_quantity: number;
  women_quantity: number;
  total_people: number;
  datetime_reserved: string;
  end_datetime_reserved: string;
  duration_minutes: number;
  is_expired: boolean;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export default function ServiceReservationDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [reservation, setReservation] = useState<ServiceReservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadReservation = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Loading reservation with ID:', id);
      const response = await servicesService.getReservation(id);
      console.log('✅ Reservation loaded successfully:', response.data);
      setReservation(response.data);
    } catch (error: any) {
      console.error('❌ Error loading reservation:', error);
      console.error('📊 Error response:', error.response?.data);
      console.error('🔍 Error status:', error.response?.status);
      
      if (error.response?.status === 500) {
        setError('Error del servidor: El endpoint de detalle de reservas tiene un problema técnico. Contacte al administrador del sistema.');
      } else {
        setError(`Error al cargar la reserva: ${error.response?.data?.detail || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservation();
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return;
    
    try {
      setUpdating(true);
      await servicesService.updateReservation(id, { status: newStatus });
      loadReservation();
    } catch (error: any) {
      console.error('Error updating reservation status:', error);
      setError('Error al actualizar el estado de la reserva');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setDeleting(true);
      await servicesService.deleteReservation(id);
      navigate('/dashboard/services/reservations');
    } catch (error: any) {
      console.error('Error deleting reservation:', error);
      setError('Error al eliminar la reserva');
    } finally {
      setDeleting(false);
      setDeleteModal(false);
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

  const getAvailableTransitions = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return ['confirmed', 'cancelled', 'rejected'];
      case 'confirmed':
        return ['in_progress', 'cancelled']; // No puede ser rechazada
      case 'in_progress':
        return ['completed', 'cancelled'];
      default:
        return []; // Estados finales
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="px-4 sm:px-0">
        <div className="text-center py-12">
          <p className="text-gray-400">Reserva no encontrada</p>
          <Button
            onClick={() => navigate('/dashboard/services/reservations')}
            className="mt-4 bg-gray-600 hover:bg-gray-700"
          >
            Volver a Reservas
          </Button>
        </div>
      </div>
    );
  }

  const availableTransitions = getAvailableTransitions(reservation.status);

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6 flex items-center gap-4">
        <Button
          onClick={() => navigate('/dashboard/services/reservations')}
          className="bg-gray-600 hover:bg-gray-700 flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Detalle de Reserva</h1>
          <p className="text-gray-300 mt-1">Información completa de la reserva</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Información de la Reserva</h2>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(reservation.status)}`}>
                  {getStatusText(reservation.status)}
                </span>
                {reservation.is_expired && (
                  <span className="px-3 py-1 text-sm rounded-full bg-red-600 text-white">
                    Expirada
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Servicio</label>
                  <p className="text-white font-semibold">{reservation.service_data.service_name}</p>
                  <p className="text-gray-400 text-sm">{reservation.service_data.service_description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Precio</label>
                  <p className="text-white">${reservation.service_data.service_price}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Albergue</label>
                  <p className="text-white">{reservation.service_data.hostel_name}</p>
                  <p className="text-gray-400 text-sm">{reservation.service_data.hostel_location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tipo</label>
                  <p className="text-white">{reservation.type_display}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Fecha y Hora</label>
                  <p className="text-white">{formatDateTime(reservation.datetime_reserved)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Duración</label>
                  <p className="text-white">{reservation.duration_minutes} minutos</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Cantidad de Personas</label>
                  <p className="text-white">
                    {reservation.total_people} (Hombres: {reservation.men_quantity}, Mujeres: {reservation.women_quantity})
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Usuario</label>
                  <p className="text-white">{reservation.user_data.full_name}</p>
                  {reservation.user_data.phone_number && (
                    <p className="text-gray-400 text-sm">{reservation.user_data.phone_number}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Horario del Servicio</label>
                  <p className="text-white">
                    {reservation.service_data.schedule_data.day_name} de {reservation.service_data.schedule_data.start_time} a {reservation.service_data.schedule_data.end_time}
                  </p>
                  <p className="text-gray-400 text-sm">Duración: {reservation.service_data.schedule_data.duration_hours} horas</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Información del Servicio</label>
                  <p className="text-white">
                    Máximo tiempo: {reservation.service_data.service_max_time} min
                  </p>
                  <p className="text-gray-400 text-sm">
                    {reservation.service_data.service_needs_approval ? 'Requiere aprobación' : 'No requiere aprobación'}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Total de Reservas</label>
                  <p className="text-white">{reservation.service_data.total_reservations} reservas</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Estado del Servicio</label>
                  <p className="text-white">
                    <span className={`px-2 py-1 text-xs rounded-full ${reservation.service_data.is_active ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                      {reservation.service_data.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Información del Sistema</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">ID de la Reserva</label>
                <p className="text-gray-300 font-mono text-sm">{reservation.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Creada por</label>
                <p className="text-gray-300">{reservation.created_by_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Creada</label>
                <p className="text-gray-300">{formatDate(reservation.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Última Actualización</label>
                <p className="text-gray-300">{formatDate(reservation.updated_at)}</p>
              </div>
            </div>
          </div>

          {availableTransitions.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Cambiar Estado</h3>
              <div className="space-y-2">
                {availableTransitions.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={updating}
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors disabled:opacity-50"
                  >
                    {getStatusText(status)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Acciones</h3>
            <div className="space-y-2">
              <button
                onClick={() => setDeleteModal(true)}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center justify-center gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                Eliminar Reserva
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar Reserva"
        message={`¿Está seguro de eliminar esta reserva? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}
