import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { adminUsersService, type AdminUser } from '~/lib/api';
import { formatDate, formatDateTime } from '~/lib/utils';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import ConfirmationModal from '~/components/modals/ConfirmationModal';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function AdminDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadAdmin = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await adminUsersService.getAdminUser(id);
      setAdmin(response.data);
    } catch (error: any) {
      console.error('Error loading admin:', error);
      setError('Error al cargar la información del administrador.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmin();
  }, [id]);

  const handleDeleteClick = () => {
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id) return;
    
    try {
      setDeleting(true);
      await adminUsersService.deleteAdminUser(id);
      navigate('/dashboard/admins/list');
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

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Activo' : 'Inactivo';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="text-center py-12">
        <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">Administrador no encontrado</p>
        <Link to="/dashboard/admins" className="btn-primary mt-4">
          Volver a Administradores
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/admins')}
          className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <UserIcon className="w-8 h-8 text-blue-400" />
            {admin.full_name}
          </h1>
          <p className="text-gray-300 mt-1">Detalle del administrador</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/dashboard/admins/edit/${admin.id}`}
            className="btn-primary flex items-center gap-2"
          >
            <PencilIcon className="w-5 h-5" />
            Editar
          </Link>
          <button
            onClick={handleDeleteClick}
            className="btn-danger flex items-center gap-2"
          >
            <TrashIcon className="w-5 h-5" />
            Eliminar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información General */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <UserIcon className="w-6 h-6 text-blue-400" />
              Información General
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre de Usuario</label>
                <p className="text-white text-lg">@{admin.username}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-sm rounded-full text-white ${getStatusColor(admin.is_active)}`}>
                    {getStatusText(admin.is_active)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre Completo</label>
                <p className="text-white">{admin.full_name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Usuario</label>
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-5 h-5 text-blue-400" />
                  <span className="text-white">Administrador</span>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Acceso */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <ClockIcon className="w-6 h-6 text-green-400" />
              Información de Acceso
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Último Acceso</label>
                <p className="text-white flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4" />
                  {admin.last_login ? formatDateTime(admin.last_login) : 'Nunca'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Miembro Desde</label>
                <p className="text-white flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4" />
                  {formatDate(admin.date_joined)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Acciones Rápidas */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Acciones</h3>
            <div className="space-y-3">
              <Link
                to={`/dashboard/admins/edit/${admin.id}`}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                <PencilIcon className="w-5 h-5" />
                Editar Administrador
              </Link>
              
              <button
                onClick={handleDeleteClick}
                className="w-full btn-danger flex items-center justify-center gap-2"
              >
                <TrashIcon className="w-5 h-5" />
                Eliminar Administrador
              </button>
            </div>
          </div>

          {/* Información del Sistema */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Información del Sistema</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">ID:</span>
                <span className="text-white font-mono text-xs">{admin.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Activo:</span>
                <span className={`${admin.is_active ? 'text-green-400' : 'text-red-400'}`}>
                  {admin.is_active ? 'Sí' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Staff:</span>
                <span className="text-blue-400">Sí</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Superusuario:</span>
                <span className="text-purple-400">Sí</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Administrador"
        message={`¿Está seguro de eliminar al administrador "${admin.full_name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleting}
        type="danger"
      />
    </div>
  );
}
