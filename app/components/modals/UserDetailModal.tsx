import { useState, useEffect } from 'react';
import Modal from '~/components/ui/Modal';
import { usersService, type CustomUser } from '~/lib/api';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { 
  UserIcon, 
  PhoneIcon, 
  CalendarIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function UserDetailModal({ isOpen, onClose, userId }: UserDetailModalProps) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadUser();
    }
  }, [isOpen, userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersService.getCustomer(userId);
      setUser(response.data);
    } catch (err) {
      console.error('Error loading user:', err);
      setError('Error al cargar los detalles del usuario');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPovertyLevelText = (level: string) => {
    const levels = {
      'LEVEL_1': 'Nivel 1',
      'LEVEL_2': 'Nivel 2', 
      'LEVEL_3': 'Nivel 3'
    };
    return levels[level as keyof typeof levels] || 'No especificado';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Usuario" size="lg">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-300">{error}</p>
        </div>
      ) : user ? (
        <div className="space-y-6">
          {/* User Header */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user.full_name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                {user.is_active ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircleIcon className="w-5 h-5 text-red-400" />
                )}
                <span className={`text-sm font-medium ${
                  user.is_active ? 'text-green-400' : 'text-red-400'
                }`}>
                  {user.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <UserGroupIcon className="w-5 h-5 mr-2" />
                Información Personal
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-400">Nombre completo</label>
                  <p className="text-white">{user.full_name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-400">Género</label>
                  <p className="text-white">{user.gender === 'M' ? 'Masculino' : 'Femenino'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-400">Edad</label>
                  <p className="text-white">{user.age} años</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-400">Nivel de pobreza</label>
                  <p className="text-white">{getPovertyLevelText(user.poverty_level)}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <PhoneIcon className="w-5 h-5 mr-2" />
                Información de Contacto
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-400">Teléfono</label>
                  <p className="text-white flex items-center">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    {user.phone_number}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-400">Fecha de registro</label>
                  <p className="text-white flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    {formatDate(user.created_at)}
                  </p>
                </div>
                
                {user.approved_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-400">Fecha de aprobación</label>
                    <p className="text-white flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {formatDate(user.approved_at)}
                    </p>
                  </div>
                )}
                
                {user.approved_by_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-400">Aprobado por</label>
                    <p className="text-white">{user.approved_by_name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
