import { useState, useEffect } from 'react';
import Modal from '~/components/ui/Modal';
import { usersService, type CustomUser } from '~/lib/api';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { 
  UserIcon, 
  PhoneIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onUserUpdated: () => void;
}

export default function UserEditModal({ isOpen, onClose, userId, onUserUpdated }: UserEditModalProps) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    age: 0,
    gender: 'M' as 'M' | 'F',
    poverty_level: 'LEVEL_1' as 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3',
    is_active: true,
  });

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
      const userData = response.data;
      setUser(userData);
      setFormData({
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone_number: userData.phone_number,
        age: userData.age,
        gender: userData.gender,
        poverty_level: userData.poverty_level,
        is_active: userData.is_active,
      });
    } catch (err) {
      console.error('Error loading user:', err);
      setError('Error al cargar los datos del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : name === 'age'
          ? parseInt(value) || 0 
          : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Validar datos
      if (!formData.first_name.trim() || !formData.last_name.trim()) {
        throw new Error('El nombre y apellido son obligatorios');
      }
      
      if (!formData.phone_number.trim()) {
        throw new Error('El teléfono es obligatorio');
      }
      
      if (formData.age < 1 || formData.age > 120) {
        throw new Error('La edad debe estar entre 1 y 120 años');
      }

      if (!['LEVEL_1', 'LEVEL_2', 'LEVEL_3'].includes(formData.poverty_level)) {
        throw new Error('El nivel de pobreza debe ser válido');
      }

      // Actualizar usuario
      await usersService.updateCustomer(userId, {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone_number: formData.phone_number.trim(),
        age: formData.age,
        gender: formData.gender,
        poverty_level: formData.poverty_level,
        is_active: formData.is_active,
      });

      onUserUpdated();
      onClose();
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message || 'Error al actualizar el usuario');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Usuario" size="lg">
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-900 border border-red-700 rounded-lg">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Información Personal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Nombre del usuario"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Apellido del usuario"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <PhoneIcon className="w-5 h-5 mr-2" />
              Información de Contacto
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="+52 81 1234 5678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Edad *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="120"
                  className="input-field"
                  placeholder="25"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <UserGroupIcon className="w-5 h-5 mr-2" />
              Información Adicional
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Género *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nivel de Pobreza *
                </label>
                <select
                  name="poverty_level"
                  value={formData.poverty_level}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="LEVEL_1">Nivel 1</option>
                  <option value="LEVEL_2">Nivel 2</option>
                  <option value="LEVEL_3">Nivel 3</option>
                </select>
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Estado del Usuario</h3>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
              />
              <label className="text-sm font-medium text-gray-300">
                Usuario activo
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : null}
    </Modal>
  );
}
