import { useState, useEffect } from 'react';
import { servicesService, type ServiceSchedule } from '~/lib/api';
import { formatDate } from '~/lib/utils';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import Button from '~/components/ui/Button';
import ConfirmationModal from '~/components/modals/ConfirmationModal';
import ServiceScheduleModal from '~/components/modals/ServiceScheduleModal';
import { 
  PlusIcon, 
  TrashIcon, 
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  EllipsisVerticalIcon,
  PencilIcon
} from '@heroicons/react/24/outline';


export default function ServiceSchedules() {
  const [schedules, setSchedules] = useState<ServiceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all');
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
  const [scheduleModal, setScheduleModal] = useState<{
    isOpen: boolean;
    schedule: ServiceSchedule | null;
  }>({
    isOpen: false,
    schedule: null
  });
  const [deleting, setDeleting] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = { 
        search: searchTerm,
      };
      
      if (statusFilter !== 'all') {
        params.is_available = statusFilter === 'available';
      }
      
      const response = await servicesService.getSchedules(params);
      setSchedules(response.data.results || []);
    } catch (error: any) {
      console.error('Error loading schedules:', error);
      setError('Error al cargar los horarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      await servicesService.deleteSchedule(deleteModal.id);
      setDeleteModal({ isOpen: false, id: null, name: '' });
      loadSchedules();
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      setError('Error al eliminar el horario');
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (schedule: ServiceSchedule) => {
    setScheduleModal({
      isOpen: true,
      schedule
    });
  };

  const handleCreateClick = () => {
    setScheduleModal({
      isOpen: true,
      schedule: null
    });
  };

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const closeDropdown = () => {
    setActiveDropdown(null);
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, id: null, name: '' });
  };

  const handleScheduleSuccess = () => {
    setScheduleModal({ isOpen: false, schedule: null });
    loadSchedules();
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
          <h1 className="text-3xl font-bold text-white">Horarios de Servicios</h1>
          <p className="text-gray-300 mt-1">
            {schedules.length} horario{schedules.length !== 1 ? 's' : ''} encontrado{schedules.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Crear Horario
        </Button>
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
              placeholder="Buscar horarios..."
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
            <div className="grid md:grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'available' | 'unavailable')}
                  className="input-field"
                >
                  <option value="all">Todos</option>
                  <option value="available">Disponibles</option>
                  <option value="unavailable">No disponibles</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de horarios */}
      <div className="space-y-4">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex gap-4 flex-1">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                    <ClockIcon className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      Horario de Servicio
                    </h3>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-300">
                      {schedule.start_time} - {schedule.end_time}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-300">
                      {schedule.duration_hours}h
                    </span>
                    {schedule.is_available ? (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                        Disponible
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded">
                        No disponible
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    <p className="mb-1">
                      <span className="text-gray-400">Creado por:</span> {schedule.created_by_name}
                    </p>
                    <p className="mb-1">
                      <span className="text-gray-400">Creado:</span> {formatDate(schedule.created_at)}
                    </p>
                    <p>
                      <span className="text-gray-400">Última actualización:</span> {formatDate(schedule.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="relative dropdown-container">
                <button
                  onClick={() => toggleDropdown(schedule.id)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                  title="Acciones"
                >
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
                
                {activeDropdown === schedule.id && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleEditClick(schedule);
                          closeDropdown();
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors w-full text-left"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Editar horario
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteClick(schedule.id, `Horario ${schedule.start_time}-${schedule.end_time}`);
                          closeDropdown();
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors w-full text-left"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Eliminar horario
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {schedules.length === 0 && !loading && (
        <div className="text-center py-12">
          <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No se encontraron horarios</p>
          <p className="text-gray-500 text-sm mt-2">
            {searchTerm || statusFilter !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda' 
              : 'Comienza creando horarios para los servicios'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Button
              onClick={handleCreateClick}
              className="btn-primary mt-4 inline-flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Crear Primer Horario
            </Button>
          )}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Horario"
        message={`¿Está seguro de eliminar el horario "${deleteModal.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />

      {/* Modal de creación/edición de horario */}
      <ServiceScheduleModal
        isOpen={scheduleModal.isOpen}
        onClose={() => setScheduleModal({ isOpen: false, schedule: null })}
        onSuccess={handleScheduleSuccess}
        schedule={scheduleModal.schedule}
        title={scheduleModal.schedule ? 'Editar Horario' : 'Crear Horario'}
      />
    </div>
  );
}
