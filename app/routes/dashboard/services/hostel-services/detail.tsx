import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { servicesService } from '~/lib/api';
import { formatDate } from '~/lib/utils';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import Button from '~/components/ui/Button';
import ConfirmationModal from '~/components/modals/ConfirmationModal';
import { 
  ArrowLeftIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface HostelService {
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
}

export default function HostelServiceDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [hostelService, setHostelService] = useState<HostelService | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadHostelService = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      console.log('🔍 Loading hostel service with ID:', id);
      const response = await servicesService.getHostelService(id);
      console.log('✅ Hostel service loaded successfully:', response.data);
      setHostelService(response.data);
    } catch (error: any) {
      console.error('❌ Error loading hostel service:', error);
      console.error('📊 Error response:', error.response?.data);
      console.error('🔍 Error status:', error.response?.status);
      
      if (error.response?.status === 500) {
        setError('Error del servidor: El endpoint de detalle de servicios de albergue tiene un problema técnico. Contacte al administrador del sistema.');
      } else {
        setError(`Error al cargar el servicio de albergue: ${error.response?.data?.detail || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHostelService();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setDeleting(true);
      await servicesService.deleteHostelService(id);
      navigate('/dashboard/services/hostel-services');
    } catch (error: any) {
      console.error('Error deleting hostel service:', error);
      setError('Error al eliminar el servicio de albergue');
    } finally {
      setDeleting(false);
      setDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hostelService) {
    return (
      <div className="px-4 sm:px-0">
        <div className="text-center py-12">
          <p className="text-gray-400">Servicio de albergue no encontrado</p>
          <Button
            onClick={() => navigate('/dashboard/services/hostel-services')}
            className="mt-4 bg-gray-600 hover:bg-gray-700"
          >
            Volver a Servicios por Albergue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6 flex items-center gap-4">
        <Button
          onClick={() => navigate('/dashboard/services/hostel-services')}
          className="bg-gray-600 hover:bg-gray-700 flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Detalle de Servicio de Albergue</h1>
          <p className="text-gray-300 mt-1">Información completa del servicio asignado al albergue</p>
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
              <h2 className="text-xl font-semibold text-white">Información del Servicio</h2>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-sm rounded-full ${hostelService.is_active ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                  {hostelService.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Servicio</label>
                  <p className="text-white font-semibold">{hostelService.service_name}</p>
                  <p className="text-gray-400 text-sm">{hostelService.service_description}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Precio</label>
                  <p className="text-white">${hostelService.service_price}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Albergue</label>
                  <p className="text-white">{hostelService.hostel_name}</p>
                  <p className="text-gray-400 text-sm">{hostelService.hostel_location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tiempo Máximo</label>
                  <p className="text-white">{hostelService.service_max_time} minutos</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Aprobación Requerida</label>
                  <p className="text-white">
                    <span className={`px-2 py-1 text-xs rounded-full ${hostelService.service_needs_approval ? 'bg-yellow-600 text-white' : 'bg-green-600 text-white'}`}>
                      {hostelService.service_needs_approval ? 'Sí' : 'No'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Total de Reservas</label>
                  <p className="text-white">{hostelService.total_reservations} reservas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Horario del Servicio</h3>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Día de la Semana</label>
                  <p className="text-white">{hostelService.schedule_data.day_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Horario</label>
                  <p className="text-white">
                    {hostelService.schedule_data.start_time} - {hostelService.schedule_data.end_time}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Duración</label>
                  <p className="text-white">{hostelService.schedule_data.duration_hours} horas</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Disponibilidad</label>
                  <p className="text-white">
                    <span className={`px-2 py-1 text-xs rounded-full ${hostelService.schedule_data.is_available ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                      {hostelService.schedule_data.is_available ? 'Disponible' : 'No disponible'}
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
                <label className="block text-sm font-medium text-gray-400 mb-1">ID del Servicio</label>
                <p className="text-gray-300 font-mono text-sm">{hostelService.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Creado por</label>
                <p className="text-gray-300">{hostelService.created_by_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Creado</label>
                <p className="text-gray-300">{formatDate(hostelService.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Última Actualización</label>
                <p className="text-gray-300">{formatDate(hostelService.updated_at)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Acciones</h3>
            <div className="space-y-2">
              <Button
                onClick={() => navigate(`/dashboard/services/hostel-services/edit/${hostelService.id}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              >
                <PencilIcon className="w-4 h-4" />
                Editar Servicio
              </Button>
              <button
                onClick={() => setDeleteModal(true)}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center justify-center gap-2"
              >
                <TrashIcon className="w-4 h-4" />
                Eliminar Servicio
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
        title="Eliminar Servicio de Albergue"
        message={`¿Está seguro de eliminar este servicio del albergue? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}
