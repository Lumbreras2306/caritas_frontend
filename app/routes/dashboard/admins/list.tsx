import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { adminUsersService, type AdminUser } from '~/lib/api';
import { formatDate } from '~/lib/utils';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import DropdownMenu from '~/components/ui/DropdownMenu';
import ConfirmationModal from '~/components/modals/ConfirmationModal';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  UserIcon,
  StarIcon
} from '@heroicons/react/24/outline';

export default function AdminsList() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    adminId: string | null;
    adminName: string;
  }>({
    isOpen: false,
    adminId: null,
    adminName: ''
  });
  const [deleting, setDeleting] = useState(false);

  const loadAdmins = async () => {
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
      
      const response = await adminUsersService.getAdminUsers(params);
      setAdmins(response.data.results);
      setTotalCount(response.data.count);
    } catch (error: any) {
      console.error('Error loading admins:', error);
      setError('Error al cargar los administradores. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, [searchTerm, statusFilter, typeFilter, currentPage]);

  const handleDeleteClick = (admin: AdminUser) => {
    setDeleteModal({
      isOpen: true,
      adminId: admin.id,
      adminName: admin.full_name
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.adminId) return;
    
    try {
      setDeleting(true);
      await adminUsersService.deleteAdminUser(deleteModal.adminId);
      loadAdmins();
      setDeleteModal({ isOpen: false, adminId: null, adminName: '' });
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      alert('Error al eliminar el administrador. Intente nuevamente.');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-600' : 'bg-red-600';
  };

  const getTypeIcon = (admin: AdminUser) => {
    return UserIcon;
  };

  const getTypeColor = (admin: AdminUser) => {
    return 'text-blue-400';
  };

  const getTypeLabel = (admin: AdminUser) => {
    return 'Administrador';
  };

  const filteredAdmins = admins;

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
          <h1 className="text-3xl font-bold text-white">Administradores</h1>
          <p className="text-gray-300 mt-1">
            {totalCount} administrador{totalCount !== 1 ? 'es' : ''} encontrado{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Link 
          to="/dashboard/admins/new"
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Administrador
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
              placeholder="Buscar por nombre de usuario o nombre completo..."
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
                  onChange={(e) => setStatusFilter(e.target.value as any)}
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

      {/* Lista de administradores */}
      <div className="space-y-4">
        {filteredAdmins.map((admin) => {
          const TypeIcon = getTypeIcon(admin);
          return (
            <div key={admin.id} className="card hover:shadow-xl transition-all duration-200">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <TypeIcon className={`w-5 h-5 ${getTypeColor(admin)} flex-shrink-0`} />
                    <h3 className="text-lg font-semibold text-white truncate">
                      {admin.full_name}
                    </h3>
                    <span className="px-2 py-1 text-xs rounded-full text-white bg-gray-600 flex-shrink-0">
                      @{admin.username}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusColor(admin.is_active)} flex-shrink-0`}>
                      {admin.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full text-white bg-purple-600 flex-shrink-0`}>
                      {getTypeLabel(admin)}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                    <div>
                      <p><strong>Usuario:</strong> {admin.username}</p>
                      <p><strong>Nombre completo:</strong> {admin.full_name}</p>
                    </div>
                    <div>
                      <p><strong>Último acceso:</strong> {admin.last_login ? formatDate(admin.last_login) : 'Nunca'}</p>
                      <p><strong>Miembro desde:</strong> {formatDate(admin.date_joined)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    to={`/dashboard/admins/detail/${admin.id}`}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Ver</span>
                  </Link>
                  
                  <DropdownMenu
                    items={[
                      {
                        label: 'Editar',
                        icon: PencilIcon,
                        onClick: () => window.location.href = `/dashboard/admins/edit/${admin.id}`,
                        className: 'text-orange-400 hover:text-orange-300'
                      },
                      {
                        label: 'Eliminar',
                        icon: TrashIcon,
                        onClick: () => handleDeleteClick(admin),
                        className: 'text-red-400 hover:text-red-300'
                      }
                    ]}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAdmins.length === 0 && !loading && (
        <div className="text-center py-12">
          <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No se encontraron administradores</p>
          <p className="text-gray-500 text-sm mt-2">
            {searchTerm || statusFilter !== 'all'
              ? 'Intenta ajustar los filtros de búsqueda' 
              : 'Comienza creando el primer administrador'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <Link to="/dashboard/admins/new" className="btn-primary mt-4 inline-flex items-center gap-2">
              <PlusIcon className="w-5 h-5" />
              Crear Primer Administrador
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

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, adminId: null, adminName: '' })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Administrador"
        message={`¿Está seguro de eliminar al administrador "${deleteModal.adminName}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleting}
        type="danger"
      />
    </div>
  );
}
