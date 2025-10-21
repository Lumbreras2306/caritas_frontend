import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { hostelsService } from '~/lib/api';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { formatDate } from '~/lib/utils';
import { 
  ArrowLeftIcon,
  BuildingOfficeIcon,
  UserIcon,
  PhoneIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface HostelReservation {
  id: string;
  user: string;
  user_name: string;
  user_phone: string;
  hostel: string;
  hostel_name: string;
  hostel_location: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'rejected' | 'checked_in' | 'checked_out';
  status_display: string;
  type: 'individual' | 'group';
  type_display: string;
  arrival_date: string;
  men_quantity?: number;
  women_quantity?: number;
  total_people: number;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
}

export default function ReservationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<HostelReservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReservation = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await hostelsService.getReservation(id);
      setReservation(response.data);
    } catch (error: any) {
      console.error('Error loading reservation:', error);
      setError('Error al cargar la información de la reserva.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !reservation) return;
    
    try {
      await hostelsService.updateReservationStatus(id, newStatus);
      loadReservation(); // Recargar para obtener el estado actualizado
    } catch (error: any) {
      console.error('Error updating reservation status:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error al cambiar el estado de la reserva. Intente nuevamente.';
      alert(errorMessage);
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

  useEffect(() => {
    loadReservation();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <Link
          to="/dashboard/hostels/reservations"
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
        >
          Volver a Reservas
        </Link>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 mb-4">Reserva no encontrada</p>
        <Link
          to="/dashboard/hostels/reservations"
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
        >
          Volver a Reservas
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard/hostels/reservations"
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Detalle de Reserva</h1>
            <p className="text-gray-400">Información completa de la reserva</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-sm rounded-full text-white ${getStatusColor(reservation.status)}`}>
            {reservation.status_display}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información del Usuario */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <UserIcon className="w-6 h-6 text-blue-400" />
              Información del Usuario
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                <p className="text-white">{reservation.user_name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
                <p className="text-white flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4" />
                  {reservation.user_phone}
                </p>
              </div>
            </div>
          </div>

          {/* Información del Albergue */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <BuildingOfficeIcon className="w-6 h-6 text-green-400" />
              Información del Albergue
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Albergue</label>
                <p className="text-white">{reservation.hostel_name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Ubicación</label>
                <p className="text-white">{reservation.hostel_location}</p>
              </div>
            </div>
          </div>

          {/* Información de la Reserva */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CalendarDaysIcon className="w-6 h-6 text-purple-400" />
              Información de la Reserva
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Llegada</label>
                <p className="text-white flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4" />
                  {formatDate(reservation.arrival_date)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Reserva</label>
                <p className="text-white">{reservation.type_display}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Total de Personas</label>
                <p className="text-white flex items-center gap-2">
                  <UserGroupIcon className="w-4 h-4" />
                  {reservation.total_people} persona{reservation.total_people !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Desglose por Género</label>
                <div className="text-white">
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
                      return parts.join(', ');
                    }
                    return 'No especificado';
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Acciones */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Acciones</h3>
            
            <div className="space-y-3">
              {reservation.status === 'pending' && (
                <button
                  onClick={() => handleStatusChange('confirmed')}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Confirmar Reserva
                </button>
              )}
              
              {reservation.status === 'confirmed' && (
                <button
                  onClick={() => handleStatusChange('checked_in')}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ClockIcon className="w-4 h-4" />
                  Check-in
                </button>
              )}
              
              {reservation.status === 'checked_in' && (
                <button
                  onClick={() => handleStatusChange('checked_out')}
                  className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ClockIcon className="w-4 h-4" />
                  Check-out
                </button>
              )}
              
              {(reservation.status === 'pending' || reservation.status === 'confirmed') && (
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  className="w-full btn-danger px-4 py-2 flex items-center justify-center gap-2"
                >
                  <XCircleIcon className="w-4 h-4" />
                  Cancelar Reserva
                </button>
              )}
            </div>
          </div>

          {/* Información Adicional */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Información Adicional</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-400">Creada:</span>
                <p className="text-white">{formatDate(reservation.created_at)}</p>
              </div>
              
              <div>
                <span className="text-gray-400">Última actualización:</span>
                <p className="text-white">{formatDate(reservation.updated_at)}</p>
              </div>
              
              {reservation.created_by_name && (
                <div>
                  <span className="text-gray-400">Creada por:</span>
                  <p className="text-white">{reservation.created_by_name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
