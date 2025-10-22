import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { servicesService, hostelsService, type Hostel } from '~/lib/api';
import { formatDate } from '~/lib/utils';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import Button from '~/components/ui/Button';
import ConfirmationModal from '~/components/modals/ConfirmationModal';
import ServiceScheduleModal from '~/components/modals/ServiceScheduleModal';
import { 
  PlusIcon, 
  TrashIcon, 
  BuildingOfficeIcon,
  CogIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  EllipsisVerticalIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface HostelService {
  id: string;
  hostel: string;
  hostel_name: string;
  service: string;
  service_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function HostelServices() {
  const [hostelServices, setHostelServices] = useState<HostelService[]>([]);
  const [allHostelServices, setAllHostelServices] = useState<HostelService[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hostelFilter, setHostelFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const loadHostelServices = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await servicesService.getHostelServices({ page_size: 100 });
      const allServices = response.data.results || [];
      setAllHostelServices(allServices);
      setHostelServices(allServices);
    } catch (error: any) {
      console.error('Error loading hostel services:', error);
      setError('Error al cargar los servicios de albergues');
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
    loadHostelServices();
  }, []);

  useEffect(() => {
    loadHostels();
  }, []);

  // Filtrar datos en el frontend
  useEffect(() => {
    let filtered = allHostelServices;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(service => 
        service.hostel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.service_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por albergue
    if (hostelFilter) {
      filtered = filtered.filter(service => service.hostel === hostelFilter);
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(service => 
        statusFilter === 'active' ? service.is_active : !service.is_active
      );
    }

    setHostelServices(filtered);
  }, [searchTerm, hostelFilter, statusFilter, allHostelServices]);

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
      await servicesService.deleteHostelService(deleteModal.id);
      setDeleteModal({ isOpen: false, id: null, name: '' });
      loadHostelServices();
    } catch (error: any) {
      console.error('Error deleting hostel service:', error);
      setError('Error al eliminar la asignación de servicio');
    } finally {
      setDeleting(false);
    }
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
          <h1 className="text-3xl font-bold text-white">Servicios por Albergue</h1>
          <p className="text-gray-300 mt-1">
            {hostelServices.length} asignación{hostelServices.length !== 1 ? 'es' : ''} encontrada{hostelServices.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <ClockIcon className="w-5 h-5" />
            Crear Horario
          </button>
          <Link to="/dashboard/services/hostel-services/new" className="btn-primary flex items-center gap-2">
            <PlusIcon className="w-5 h-5" />
            Asignar Servicio
          </Link>
        </div>
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
              placeholder="Buscar por albergue o servicio..."
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  className="input-field"
                >
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de servicios por albergue */}
      <div className="space-y-4">
        {hostelServices.map((hostelService) => (
          <div key={hostelService.id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex gap-4 flex-1">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                    <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-white">{hostelService.hostel_name}</h3>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-300">{hostelService.service_name}</span>
                    {hostelService.is_active ? (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded">
                        Inactivo
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    <p className="mb-1">
                      <span className="text-gray-400">Asignado:</span> {formatDate(hostelService.created_at)}
                    </p>
                    <p>
                      <span className="text-gray-400">Última actualización:</span> {formatDate(hostelService.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="relative dropdown-container">
                <button
                  onClick={() => toggleDropdown(hostelService.id)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                  title="Acciones"
                >
                  <EllipsisVerticalIcon className="w-5 h-5" />
                </button>
                
                {activeDropdown === hostelService.id && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10">
                    <div className="py-1">
                      <Link
                        to={`/dashboard/services/hostel-services/detail/${hostelService.id}`}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        onClick={closeDropdown}
                      >
                        <EyeIcon className="w-4 h-4" />
                        Ver detalles
                      </Link>
                      <Link
                        to={`/dashboard/services/hostel-services/edit/${hostelService.id}`}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                        onClick={closeDropdown}
                      >
                        <CogIcon className="w-4 h-4" />
                        Editar asignación
                      </Link>
                      <button
                        onClick={() => {
                          handleDeleteClick(hostelService.id, `${hostelService.hostel_name} - ${hostelService.service_name}`);
                          closeDropdown();
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors w-full text-left"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Eliminar asignación
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {hostelServices.length === 0 && !loading && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No se encontraron asignaciones</p>
          <p className="text-gray-500 text-sm mt-2">
            {searchTerm || hostelFilter || statusFilter !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda' 
              : 'Comienza asignando servicios a albergues'
            }
          </p>
          {!searchTerm && !hostelFilter && statusFilter === 'all' && (
            <Link to="/dashboard/services/hostel-services/new" className="btn-primary mt-4 inline-flex items-center gap-2">
              <PlusIcon className="w-5 h-5" />
              Asignar Primer Servicio
            </Link>
          )}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Asignación"
        message={`¿Está seguro de eliminar la asignación "${deleteModal.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />

      {/* Modal de creación de horario */}
      <ServiceScheduleModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSuccess={() => {
          setShowScheduleModal(false);
          // Opcional: recargar datos si es necesario
        }}
        title="Crear Horario de Servicio"
      />
    </div>
  );
}
