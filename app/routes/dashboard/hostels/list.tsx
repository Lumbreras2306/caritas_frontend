import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { hostelsService, type Hostel } from '~/lib/api';
import { formatDate } from '~/lib/utils';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import ConfirmationModal from '~/components/modals/ConfirmationModal';
import { 
  PencilIcon, 
  TrashIcon, 
  MapPinIcon, 
  EyeIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export default function HostelsList() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    hostelId: string | null;
    hostelName: string;
  }>({
    isOpen: false,
    hostelId: null,
    hostelName: ''
  });
  const [deleting, setDeleting] = useState(false);

  const loadHostels = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = { 
        search: searchTerm,
        page: currentPage,
        page_size: 12
      };
      
      if (statusFilter !== 'all') {
        params.is_active = statusFilter === 'active';
      }
      
      const response = await hostelsService.getHostels(params);
      console.log('🔍 Datos recibidos del backend (Hostels List):', response.data);
      console.log('📋 Albergues recibidos:', response.data.results);
      if (response.data.results.length > 0) {
        console.log('📍 Ubicación del primer albergue:', response.data.results[0].location);
      }
      setHostels(response.data.results);
      setTotalCount(response.data.count);
    } catch (error: any) {
      console.error('Error loading hostels:', error);
      setError('Error al cargar los albergues. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHostels();
  }, [searchTerm, statusFilter, currentPage]);

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({
      isOpen: true,
      hostelId: id,
      hostelName: name
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.hostelId) return;
    
    try {
      setDeleting(true);
      await hostelsService.deleteHostel(deleteModal.hostelId);
      setDeleteModal({ isOpen: false, hostelId: null, hostelName: '' });
      loadHostels();
    } catch (error: any) {
      console.error('Error deleting hostel:', error);
      setError('Error al eliminar el albergue. Intente nuevamente.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, hostelId: null, hostelName: '' });
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
          <h1 className="text-3xl font-bold text-white">Albergues</h1>
          <p className="text-gray-300 mt-1">
            {totalCount} albergue{totalCount !== 1 ? 's' : ''} encontrado{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/dashboard/hostels/new" className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Nuevo Albergue
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
              placeholder="Buscar por nombre, ciudad o dirección..."
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
            <div className="flex flex-wrap gap-4">
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

      {/* Lista de albergues */}
      <div className="space-y-4">
        {hostels.map((hostel) => (
          <div key={hostel.id} className="card hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-white">{hostel.name}</h3>
                  {hostel.is_active ? (
                    <span className="px-2 py-1 bg-gray-600 text-white text-xs rounded">
                      Activo
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded">
                      Inactivo
                    </span>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300 mb-4">
                  <div>
                    <div className="flex items-start gap-2 mb-2">
                      <MapPinIcon className="w-4 h-4 mt-1 flex-shrink-0 text-gray-400" />
                      <span>{hostel.location_data.address}, {hostel.location_data.city}, {hostel.location_data.state}</span>
                    </div>
                    <p className="flex items-center gap-2">
                      <span className="text-gray-400">📞</span> {hostel.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Capacidad</p>
                    <div className="flex gap-4">
                      <span className="text-sm">Hombres: <strong>{hostel.men_capacity}</strong></span>
                      <span className="text-sm">Mujeres: <strong>{hostel.women_capacity}</strong></span>
                    </div>
                    <p className="text-gray-400 text-xs mt-2">
                      Creado: {formatDate(hostel.created_at)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  to={`/dashboard/hostels/detail/${hostel.id}`}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors flex items-center justify-center gap-1 text-sm"
                >
                  <EyeIcon className="w-4 h-4" />
                  Ver
                </Link>
                
                <Link
                  to={`/dashboard/hostels/edit/${hostel.id}`}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors flex items-center justify-center gap-1 text-sm"
                >
                  <PencilIcon className="w-4 h-4" />
                  Editar
                </Link>
                
                <button
                  onClick={() => handleDeleteClick(hostel.id, hostel.name)}
                  className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                  title="Eliminar albergue"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hostels.length === 0 && !loading && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No se encontraron albergues</p>
          <p className="text-gray-500 text-sm mt-2">
            {searchTerm || statusFilter !== 'all' 
              ? 'Intenta ajustar los filtros de búsqueda' 
              : 'Comienza creando tu primer albergue'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Link to="/dashboard/hostels/new" className="btn-primary mt-4 inline-flex items-center gap-2">
              <PlusIcon className="w-5 h-5" />
              Crear Primer Albergue
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

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Albergue"
        message={`¿Está seguro de eliminar el albergue "${deleteModal.hostelName}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        loading={deleting}
      />
    </div>
  );
}