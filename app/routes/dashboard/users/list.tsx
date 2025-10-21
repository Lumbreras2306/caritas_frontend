import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { usersService, type CustomUser } from '~/lib/api';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import UserDetailModal from '~/components/modals/UserDetailModal';
import UserEditModal from '~/components/modals/UserEditModal';
import UserDeleteModal from '~/components/modals/UserDeleteModal';
import { 
  UserPlusIcon, 
  EyeIcon, 
  TrashIcon,
  PencilIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

export default function UsersList() {
  const [allUsers, setAllUsers] = useState<CustomUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<CustomUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CustomUser | null>(null);

  // Load all users once
  useEffect(() => {
    loadAllUsers();
  }, []);

  // Filter users when search term changes
  useEffect(() => {
    filterUsers();
  }, [searchTerm, allUsers]);

  const loadAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all users with a large page size
      const response = await usersService.getCustomers({ page_size: 1000 });
      setAllUsers(response.data.results);
    } catch (err: any) {
      console.error('Error loading users:', err);
      
      // Manejar errores de validación del backend
      if (err.response?.status === 400 && err.response?.data) {
        const errorData = err.response.data;
        let errorMessage = 'Error de validación:\n';
        
        // Procesar errores de campos específicos
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field])) {
            errorMessage += `• ${field}: ${errorData[field].join(', ')}\n`;
          } else {
            errorMessage += `• ${field}: ${errorData[field]}\n`;
          }
        });
        
        setError(errorMessage);
      } else {
        setError(err.message || 'Error al cargar los usuarios');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(allUsers);
      setCurrentPage(1);
      return;
    }

    const filtered = allUsers.filter(user => 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone_number.includes(searchTerm) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleViewUser = (user: CustomUser) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  const handleEditUser = (user: CustomUser) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDeleteUser = (user: CustomUser) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleUserUpdated = () => {
    loadAllUsers();
  };

  const handleUserDeleted = () => {
    loadAllUsers();
    setSelectedUser(null);
  };

  const handleBulkDeactivate = async () => {
    if (selectedUsers.length === 0) {
      alert('Selecciona al menos un usuario');
      return;
    }

    if (!confirm(`¿Estás seguro de que quieres desactivar ${selectedUsers.length} usuario(s)?`)) {
      return;
    }

    try {
      await usersService.deactivateMultiple(selectedUsers);
      setSelectedUsers([]);
      loadAllUsers();
      alert('Usuarios desactivados correctamente');
    } catch (err: any) {
      console.error('Error deactivating users:', err);
      
      // Manejar errores de validación del backend
      if (err.response?.status === 400 && err.response?.data) {
        const errorData = err.response.data;
        let errorMessage = 'Error de validación:\n';
        
        // Procesar errores de campos específicos
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field])) {
            errorMessage += `• ${field}: ${errorData[field].join(', ')}\n`;
          } else {
            errorMessage += `• ${field}: ${errorData[field]}\n`;
          }
        });
        
        alert(errorMessage);
      } else {
        alert(err.message || 'Error al desactivar usuarios');
      }
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === currentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(currentUsers.map(user => user.id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Lista de Usuarios
              </h1>
              <p className="mt-2 text-gray-300">
                Gestiona los usuarios del sistema
              </p>
            </div>
            <Link
              to="/dashboard/users/new"
              className="btn-primary flex items-center space-x-2"
            >
              <UserPlusIcon className="w-5 h-5" />
              <span>Nuevo Usuario</span>
            </Link>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar usuarios por nombre, apellido o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pr-10"
                />
                {searchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-sm text-gray-400">
                      {filteredUsers.length} resultado{filteredUsers.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {selectedUsers.length > 0 && (
              <button
                onClick={handleBulkDeactivate}
                className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2"
              >
                <TrashIcon className="w-5 h-5" />
                <span>Desactivar ({selectedUsers.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-300 mb-2">
                  Error de validación
                </h3>
                <div className="text-sm text-red-300 whitespace-pre-line">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Edad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Registrado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {user.full_name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {user.gender === 'M' ? 'Masculino' : 'Femenino'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-300">
                        <PhoneIcon className="w-4 h-4 mr-2" />
                        {user.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {user.age} años
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {user.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-300">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {formatDate(user.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Ver detalles"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-yellow-400 hover:text-yellow-300"
                          title="Editar"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-400 hover:text-red-300"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {currentUsers.length === 0 && (
            <div className="text-center py-12">
              <UserIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No hay usuarios
              </h3>
              <p className="text-gray-400 mb-4">
                {searchTerm ? 'No se encontraron usuarios con ese criterio' : 'Aún no hay usuarios registrados'}
              </p>
              {!searchTerm && (
                <Link
                  to="/dashboard/users/new"
                  className="btn-primary"
                >
                  Crear primer usuario
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Anterior
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === page
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <UserDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedUser(null);
        }}
        userId={selectedUser?.id || ''}
      />

      <UserEditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        userId={selectedUser?.id || ''}
        onUserUpdated={handleUserUpdated}
      />

      <UserDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onUserDeleted={handleUserDeleted}
      />
    </div>
  );
}