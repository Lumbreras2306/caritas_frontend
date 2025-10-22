import { useState, useEffect } from 'react';
import Modal from '~/components/ui/Modal';
import { hostelsService, usersService } from '~/lib/api';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  CalendarDaysIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface NewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReservationCreated: () => void;
}

interface Hostel {
  id: string;
  name: string;
  location: string;
  formatted_address?: string;
  men_capacity: number;
  women_capacity: number;
  is_active: boolean;
}

interface User {
  id: string;
  full_name: string;
  phone_number: string;
  gender: 'M' | 'F';
}

export default function NewReservationModal({ 
  isOpen, 
  onClose, 
  onReservationCreated 
}: NewReservationModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [formData, setFormData] = useState({
    user: '',
    user_id: '',
    hostel: '',
    hostel_id: '',
    type: 'individual' as 'individual' | 'group',
    arrival_date: '',
    men_quantity: 0,
    women_quantity: 0,
  });

  // Estados para autocompletado
  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
  const [hostelSuggestions, setHostelSuggestions] = useState<Hostel[]>([]);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [showHostelSuggestions, setShowHostelSuggestions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.autocomplete-container')) {
        setShowUserSuggestions(false);
        setShowHostelSuggestions(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [hostelsRes, usersRes] = await Promise.all([
        hostelsService.getHostels({ page_size: 100, is_active: true }),
        usersService.getCustomers({ page_size: 100 })
      ]);
      
      setHostels(hostelsRes.data.results);
      setUsers(usersRes.data.results);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos necesarios');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'number' ? parseInt(value) || 0 : value
      };

      // Si se cambia el tipo a individual, ajustar las cantidades
      if (name === 'type' && value === 'individual') {
        // Buscar el usuario seleccionado para obtener su género
        const selectedUser = users.find(u => u.id === newData.user_id);
        if (selectedUser) {
          if (selectedUser.gender === 'M') {
            newData.men_quantity = 1;
            newData.women_quantity = 0;
          } else {
            newData.men_quantity = 0;
            newData.women_quantity = 1;
          }
        } else {
          // Si no hay usuario seleccionado, usar valores por defecto
          newData.men_quantity = 1;
          newData.women_quantity = 0;
        }
      }

      return newData;
    });
  };

  // Funciones para autocompletado
  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, user: value, user_id: '' }));
    
    if (value.length > 0) {
      const filtered = users.filter(user => 
        user.full_name.toLowerCase().includes(value.toLowerCase()) ||
        user.phone_number.includes(value)
      );
      setUserSuggestions(filtered);
      setShowUserSuggestions(true);
    } else {
      setUserSuggestions([]);
      setShowUserSuggestions(false);
    }
  };

  const handleHostelInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, hostel: value, hostel_id: '' }));
    
    if (value.length > 0) {
      const filtered = hostels.filter(hostel => 
        hostel.name.toLowerCase().includes(value.toLowerCase()) ||
        hostel.formatted_address?.toLowerCase().includes(value.toLowerCase())
      );
      setHostelSuggestions(filtered);
      setShowHostelSuggestions(true);
    } else {
      setHostelSuggestions([]);
      setShowHostelSuggestions(false);
    }
  };

  const selectUser = (user: User) => {
    setFormData(prev => {
      const newData = { 
        ...prev, 
        user: user.full_name, 
        user_id: user.id 
      };
      
      // Si el tipo es individual, ajustar las cantidades basándose en el género del usuario
      if (prev.type === 'individual') {
        if (user.gender === 'M') {
          newData.men_quantity = 1;
          newData.women_quantity = 0;
        } else {
          newData.men_quantity = 0;
          newData.women_quantity = 1;
        }
      }
      
      return newData;
    });
    setShowUserSuggestions(false);
  };

  const selectHostel = (hostel: Hostel) => {
    setFormData(prev => ({ 
      ...prev, 
      hostel: hostel.name, 
      hostel_id: hostel.id 
    }));
    setShowHostelSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      // Validar que se haya seleccionado usuario y albergue
      if (!formData.user_id || !formData.hostel_id) {
        setError('Por favor seleccione un usuario y un albergue válidos');
        return;
      }
      
      // Validar cantidades según el tipo
      if (formData.type === 'individual') {
        if (formData.men_quantity + formData.women_quantity !== 1) {
          setError('Para reserva individual debe haber exactamente 1 persona');
          return;
        }
      } else {
        if (formData.men_quantity + formData.women_quantity < 2) {
          setError('Para reserva grupal debe haber al menos 2 personas');
          return;
        }
      }
      
      const reservationData = {
        user: formData.user_id,
        hostel: formData.hostel_id,
        type: formData.type,
        arrival_date: formData.arrival_date,
        men_quantity: formData.men_quantity,
        women_quantity: formData.women_quantity,
      };
      
      await hostelsService.createReservation(reservationData);
      onReservationCreated();
      onClose();
      
      // Reset form
      setFormData({
        user: '',
        user_id: '',
        hostel: '',
        hostel_id: '',
        type: 'individual',
        arrival_date: '',
        men_quantity: 0,
        women_quantity: 0,
      });
    } catch (err: any) {
      console.error('Error creating reservation:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al crear la reserva. Intente nuevamente.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getSelectedHostel = () => {
    return hostels.find(h => h.id === formData.hostel_id);
  };

  const getSelectedUser = () => {
    return users.find(u => u.id === formData.user_id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Reserva de Albergue" size="lg">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-600/20 border border-red-600 text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Usuario */}
          <div className="relative autocomplete-container">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Usuario *
            </label>
            <input
              type="text"
              name="user"
              value={formData.user}
              onChange={handleUserInputChange}
              placeholder="Buscar usuario por nombre o teléfono..."
              required
              className="input-field"
              autoComplete="off"
            />
            {showUserSuggestions && userSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {userSuggestions.map(user => (
                  <div
                    key={user.id}
                    onClick={() => selectUser(user)}
                    className="px-4 py-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0"
                  >
                    <div className="text-white font-medium">{user.full_name}</div>
                    <div className="text-gray-400 text-sm">{user.phone_number}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Albergue */}
          <div className="relative autocomplete-container">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Albergue *
            </label>
            <input
              type="text"
              name="hostel"
              value={formData.hostel}
              onChange={handleHostelInputChange}
              placeholder="Buscar albergue por nombre o ubicación..."
              required
              className="input-field"
              autoComplete="off"
            />
            {showHostelSuggestions && hostelSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {hostelSuggestions.map(hostel => (
                  <div
                    key={hostel.id}
                    onClick={() => selectHostel(hostel)}
                    className="px-4 py-3 hover:bg-gray-600 cursor-pointer border-b border-gray-600 last:border-b-0"
                  >
                    <div className="text-white font-medium">{hostel.name}</div>
                    <div className="text-gray-400 text-sm">{hostel.formatted_address || hostel.location}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tipo de reserva */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Reserva *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="input-field"
            >
              <option value="individual">Individual</option>
              <option value="group">Grupal</option>
            </select>
          </div>

          {/* Fecha de llegada */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fecha de Llegada *
            </label>
            <input
              type="date"
              name="arrival_date"
              value={formData.arrival_date}
              onChange={handleInputChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="input-field"
            />
          </div>

          {/* Cantidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cantidad de Hombres *
                {formData.type === 'individual' && formData.user_id && (() => {
                  const selectedUser = users.find(u => u.id === formData.user_id);
                  return selectedUser ? (
                    <span className="text-yellow-400 text-xs ml-2">
                      ({selectedUser.gender === 'M' ? '1' : '0'})
                    </span>
                  ) : null;
                })()}
                {formData.type === 'individual' && !formData.user_id && (
                  <span className="text-yellow-400 text-xs ml-2">(Seleccione un usuario primero)</span>
                )}
              </label>
              <input
                type="number"
                name="men_quantity"
                value={formData.men_quantity}
                onChange={handleInputChange}
                min="0"
                max={formData.type === 'individual' ? 1 : undefined}
                disabled={formData.type === 'individual'}
                required
                className={`input-field ${formData.type === 'individual' ? 'bg-gray-700 cursor-not-allowed' : ''}`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cantidad de Mujeres *
                {formData.type === 'individual' && formData.user_id && (() => {
                  const selectedUser = users.find(u => u.id === formData.user_id);
                  return selectedUser ? (
                    <span className="text-yellow-400 text-xs ml-2">
                      ({selectedUser.gender === 'F' ? '1' : '0'})
                    </span>
                  ) : null;
                })()}
                {formData.type === 'individual' && !formData.user_id && (
                  <span className="text-yellow-400 text-xs ml-2">(Seleccione un usuario primero)</span>
                )}
              </label>
              <input
                type="number"
                name="women_quantity"
                value={formData.women_quantity}
                onChange={handleInputChange}
                min="0"
                max={formData.type === 'individual' ? 1 : undefined}
                disabled={formData.type === 'individual'}
                required
                className={`input-field ${formData.type === 'individual' ? 'bg-gray-700 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>


          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-700">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Creando...</span>
                </>
              ) : (
                <span>Crear Reserva</span>
              )}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
