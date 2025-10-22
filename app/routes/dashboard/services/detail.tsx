import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { servicesService, type Service } from '~/lib/api';
import { formatDate } from '~/lib/utils';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import Button from '~/components/ui/Button';
import ConfirmationModal from '~/components/modals/ConfirmationModal';
import { 
  PencilIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  CogIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function ServiceDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);

  const loadService = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await servicesService.getService(id);
      setService(response.data);
    } catch (error: any) {
      console.error('Error loading service:', error);
      setError('Error al cargar el servicio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadService();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setDeleting(true);
      await servicesService.deleteService(id);
      navigate('/dashboard/services/list');
    } catch (error: any) {
      console.error('Error deleting service:', error);
      setError('Error al eliminar el servicio');
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

  if (!service) {
    return (
      <div className="px-4 sm:px-0">
        <div className="text-center py-12">
          <p className="text-gray-400">Servicio no encontrado</p>
          <Button
            onClick={() => navigate('/dashboard/services/list')}
            className="mt-4 bg-gray-600 hover:bg-gray-700"
          >
            Volver a Servicios
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6 flex items-center gap-4">
        <Button
          onClick={() => navigate('/dashboard/services/list')}
          className="bg-gray-600 hover:bg-gray-700 flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">{service.name}</h1>
          <p className="text-gray-300 mt-1">Detalles del servicio</p>
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
              <h2 className="text-xl font-semibold text-white">Información General</h2>
              <div className="flex gap-2">
                <Link
                  to={`/dashboard/services/edit/${service.id}`}
                  className="btn-secondary flex items-center gap-2"
                >
                  <PencilIcon className="w-4 h-4" />
                  Editar
                </Link>
                <button
                  onClick={() => setDeleteModal(true)}
                  className="btn-danger flex items-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Descripción</label>
                <p className="text-gray-300">{service.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Precio</label>
                  <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-white font-semibold">${service.price}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tiempo Máximo</label>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-white">{service.max_time} minutos</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tipo de Reserva</label>
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-white">
                      {service.reservation_type === 'individual' ? 'Individual' : 'Grupal'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Estado</label>
                  <div className="flex items-center gap-2">
                    {service.is_active ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-red-400" />
                    )}
                    <span className={service.is_active ? 'text-green-400' : 'text-red-400'}>
                      {service.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Requiere Aprobación</label>
                <div className="flex items-center gap-2">
                  {service.needs_approval ? (
                    <CheckCircleIcon className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <XCircleIcon className="w-5 h-5 text-green-400" />
                  )}
                  <span className={service.needs_approval ? 'text-yellow-400' : 'text-green-400'}>
                    {service.needs_approval ? 'Sí' : 'No'}
                  </span>
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
                <p className="text-gray-300 font-mono text-sm">{service.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Creado</label>
                <p className="text-gray-300">{formatDate(service.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Última Actualización</label>
                <p className="text-gray-300">{formatDate(service.updated_at)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <Link
                to={`/dashboard/services/edit/${service.id}`}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <PencilIcon className="w-4 h-4" />
                Editar Servicio
              </Link>
              <Link
                to="/dashboard/services/hostel-services"
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <CogIcon className="w-4 h-4" />
                Asignar a Albergues
              </Link>
              <Link
                to="/dashboard/services/reservations"
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <ClockIcon className="w-4 h-4" />
                Ver Reservas
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Eliminar Servicio"
        message={`¿Está seguro de eliminar el servicio "${service.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}
