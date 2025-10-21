import { useState } from 'react';
import Modal from '~/components/ui/Modal';
import { usersService, type CustomUser } from '~/lib/api';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { 
  ExclamationTriangleIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface UserDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: CustomUser | null;
  onUserDeleted: () => void;
}

export default function UserDeleteModal({ isOpen, onClose, user, onUserDeleted }: UserDeleteModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!user) return;

    try {
      setDeleting(true);
      setError(null);
      
      await usersService.deleteCustomer(user.id);
      onUserDeleted();
      onClose();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Error al eliminar el usuario');
    } finally {
      setDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Eliminación" size="sm">
      <div className="space-y-6">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-900 rounded-full flex items-center justify-center">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
        </div>

        {/* Warning Message */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            ¿Eliminar usuario?
          </h3>
          <p className="text-gray-300 mb-4">
            Esta acción no se puede deshacer. Se eliminará permanentemente:
          </p>
          
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user.full_name.charAt(0)}
                </span>
              </div>
              <div className="text-left">
                <p className="text-white font-medium">{user.full_name}</p>
                <p className="text-gray-400 text-sm">{user.phone_number}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-900 border border-red-700 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <XMarkIcon className="w-4 h-4" />
            <span>Cancelar</span>
          </button>
          
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {deleting ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <TrashIcon className="w-4 h-4" />
                <span>Eliminar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
