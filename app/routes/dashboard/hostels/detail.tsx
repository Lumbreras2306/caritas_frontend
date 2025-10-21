import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { hostelsService, type Hostel } from '~/lib/api';
import { formatCoordinate, formatDate } from '~/lib/utils';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import ConfirmationModal from '~/components/modals/ConfirmationModal';
import ReadOnlyMap from '~/components/maps/ReadOnlyMap';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  PhoneIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function HostelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadHostel = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await hostelsService.getHostel(id);
      setHostel(response.data);
    } catch (error: any) {
      console.error('Error loading hostel:', error);
      setError('Error al cargar la información del albergue.');
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteClick = () => {
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    
    try {
      setDeleting(true);
      await hostelsService.deleteHostel(id);
      setDeleteModal(false);
      navigate('/dashboard/hostels/list');
    } catch (error: any) {
      console.error('Error deleting hostel:', error);
      setError('Error al eliminar el albergue. Intente nuevamente.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal(false);
  };


  useEffect(() => {
    loadHostel();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !hostel) {
    return (
      <div className="px-4 sm:px-0">
        <div className="text-center py-12">
          <XCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-4">{error || 'Albergue no encontrado'}</p>
          <Link to="/dashboard/hostels/list" className="btn-primary">
            Volver a la Lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              to="/dashboard/hostels/list" 
              className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-white" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white">{hostel.name}</h1>
              <p className="text-gray-300 mt-1">Información detallada del albergue</p>
            </div>
            <div className="flex items-center gap-2">
              {hostel.is_active ? (
                <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full flex items-center gap-1">
                  <CheckCircleIcon className="w-4 h-4" />
                  Activo
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-600 text-white text-sm rounded-full flex items-center gap-1">
                  <XCircleIcon className="w-4 h-4" />
                  Inactivo
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información General */}
        <div className="card">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <BuildingOfficeIcon className="w-6 h-6 text-blue-400" />
                Información General
              </h2>
              
              {/* Imagen del albergue */}
              {hostel.image_url && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Imagen del Albergue</label>
                  <div className="relative">
                    <img
                      src={hostel.image_url}
                      alt={hostel.name}
                      className="w-full max-w-md h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nombre</label>
                  <p className="text-white">{hostel.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
                  <p className="text-white flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4" />
                    {hostel.phone}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                  <div className="flex items-center gap-2">
                    {hostel.is_active ? (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Fecha de Creación</label>
                  <p className="text-white flex items-center gap-2">
                    <CalendarDaysIcon className="w-4 h-4" />
                    {formatDate(hostel.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Capacidades */}
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <UserGroupIcon className="w-6 h-6 text-green-400" />
                Capacidades
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Capacidad Hombres</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-white">{hostel.men_capacity}</span>
                      <span className="text-sm text-gray-400 ml-2">máx</span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">En uso:</span>
                      <span className="text-blue-400 font-medium">
                        {hostel.current_men_capacity || 0} / {hostel.men_capacity || 0}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(((hostel.current_men_capacity || 0) / (hostel.men_capacity || 1)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Capacidad Mujeres</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-white">{hostel.women_capacity}</span>
                      <span className="text-sm text-gray-400 ml-2">máx</span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">En uso:</span>
                      <span className="text-pink-400 font-medium">
                        {hostel.current_women_capacity || 0} / {hostel.women_capacity || 0}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-pink-500 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(((hostel.current_women_capacity || 0) / (hostel.women_capacity || 1)) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Capacidad Total</span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-white">
                      {hostel.men_capacity + hostel.women_capacity} personas
                    </span>
                    <span className="text-sm text-gray-400 ml-2">máx</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">En uso:</span>
                  <span className="text-green-400 font-medium">
                    {(hostel.current_men_capacity || 0) + (hostel.current_women_capacity || 0)} / {(hostel.men_capacity || 0) + (hostel.women_capacity || 0)}
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ 
                      width: `${Math.min((((hostel.current_men_capacity || 0) + (hostel.current_women_capacity || 0)) / ((hostel.men_capacity || 0) + (hostel.women_capacity || 0) || 1)) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div className="card">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <MapPinIcon className="w-6 h-6 text-red-400" />
                Ubicación
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Dirección</label>
                  <p className="text-white">{hostel.location_data.address}</p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Ciudad</label>
                    <p className="text-white">{hostel.location_data.city}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                    <p className="text-white">{hostel.location_data.state}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Código Postal</label>
                    <p className="text-white">{hostel.location_data.zip_code}</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Latitud</label>
                    <p className="text-white font-mono text-sm">{formatCoordinate(hostel.location_data.latitude)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Longitud</label>
                    <p className="text-white font-mono text-sm">{formatCoordinate(hostel.location_data.longitude)}</p>
                  </div>
                </div>
                
                {hostel.location_data.landmarks && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Referencias</label>
                    <p className="text-white">{hostel.location_data.landmarks}</p>
                  </div>
                )}
                
                {hostel.location_data.formatted_address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Dirección Completa</label>
                    <p className="text-white text-sm">{hostel.location_data.formatted_address}</p>
                  </div>
                )}
              </div>
              
              {/* Mapa de la ubicación */}
              <div className="mt-6">
                <ReadOnlyMap
                  latitude={parseFloat(hostel.location_data.latitude)}
                  longitude={parseFloat(hostel.location_data.longitude)}
                  height="300px"
                  title="Ubicación del albergue"
                />
                {hostel.location_data.google_maps_url && (
                  <div className="mt-3">
                    <a
                      href={hostel.location_data.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                    >
                      <MapPinIcon className="w-4 h-4" />
                      Abrir en Google Maps
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">

            {/* Acciones */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Acciones</h3>
              
              <div className="space-y-3">
                <Link
                  to={`/dashboard/hostels/edit/${hostel.id}`}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <PencilIcon className="w-5 h-5" />
                  Editar Albergue
                </Link>
                
                <Link
                  to={`/dashboard/hostels/reservations?hostel=${hostel.id}`}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <CalendarDaysIcon className="w-5 h-5" />
                  Ver Reservas
                </Link>
                
                <button
                  onClick={handleDeleteClick}
                  className="w-full btn-danger px-4 py-2 flex items-center justify-center gap-2"
                >
                  <TrashIcon className="w-5 h-5" />
                  Eliminar Albergue
                </button>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Información Adicional</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">ID:</span>
                  <span className="text-white font-mono">{hostel.id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-300">Creado:</span>
                  <span className="text-white">{formatDate(hostel.created_at)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-300">Última actualización:</span>
                  <span className="text-white">{formatDate(hostel.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={deleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Albergue"
        message={`¿Está seguro de eliminar el albergue "${hostel?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}
