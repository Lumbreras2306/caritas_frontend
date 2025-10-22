import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { servicesService, usersService, hostelsService } from '~/lib/api';
import Button from '~/components/ui/Button';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface Service {
  id: string; // ID del hostel-service
  service_id: string; // ID del servicio original
  name: string;
  price: number;
  reservation_type: 'individual' | 'group';
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

interface Hostel {
  id: string;
  name: string;
}

export default function NewServiceReservation() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showHostelSuggestions, setShowHostelSuggestions] = useState(false);
  const [hostelSearchTerm, setHostelSearchTerm] = useState('');
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [formData, setFormData] = useState({
    user: '',
    hostel: '',
    service: '',
    status: 'pending' as 'pending' | 'confirmed' | 'cancelled' | 'rejected' | 'completed' | 'in_progress',
    type: 'individual' as 'individual' | 'group',
    men_quantity: 1,
    women_quantity: 0,
    datetime_reserved: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Solo cargar usuarios y albergues inicialmente
      const [usersResponse, hostelsResponse] = await Promise.all([
        usersService.getCustomers({ page_size: 100 }),
        hostelsService.getHostels({ page_size: 100 })
      ]);
      
      setUsers(usersResponse.data.results);
      setHostels(hostelsResponse.data.results);
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos necesarios');
    } finally {
      setLoading(false);
    }
  };

  const loadHostelServices = async (hostelId: string) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🏨 Loading services for hostel:', hostelId);
      
      // Cargar servicios específicos del albergue seleccionado
      const hostelServicesResponse = await servicesService.getHostelServices({ 
        hostel: hostelId,
        page_size: 100 
      });
      
      // Extraer servicios únicos de los hostel-services
      const availableServices = hostelServicesResponse.data.results?.map((hs: any) => ({
        id: hs.id, // Usar el ID del hostel-service, no del service
        service_id: hs.service, // Guardar el ID del servicio original
        name: hs.service_name,
        price: hs.service_price || 0,
        reservation_type: hs.service_type || 'individual'
      })) || [];
      
      // Eliminar duplicados por ID
      const uniqueServices = availableServices.filter((service: any, index: number, self: any[]) => 
        index === self.findIndex((s: any) => s.id === service.id)
      );
      
      console.log('🏨 Hostel services loaded:', hostelServicesResponse.data.results);
      console.log('🔧 Available services for this hostel:', uniqueServices);
      
      setServices(uniqueServices);
    } catch (error: any) {
      console.error('Error loading hostel services:', error);
      setError('Error al cargar los servicios del albergue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-autocomplete')) {
        setShowUserSuggestions(false);
      }
      if (!target.closest('.hostel-autocomplete')) {
        setShowHostelSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Validación de campos requeridos
    if (!formData.user) {
      setError('Debe seleccionar un usuario');
      setSaving(false);
      return;
    }

    if (!formData.hostel || !selectedHostel) {
      setError('Debe seleccionar un albergue');
      setSaving(false);
      return;
    }

    if (!formData.service) {
      setError('Debe seleccionar un servicio');
      setSaving(false);
      return;
    }

    if (!formData.datetime_reserved) {
      setError('Debe seleccionar una fecha y hora');
      setSaving(false);
      return;
    }

    // Convertir fecha a formato ISO
    const isoDateTime = new Date(formData.datetime_reserved).toISOString();
    
    // Encontrar el servicio seleccionado para obtener el service_id
    const selectedService = services.find(s => s.id === formData.service);
    
    const requestData = {
      user: formData.user,
      service: formData.service, // Usar el ID del hostel-service (no el service_id)
      status: formData.status,
      type: formData.type,
      men_quantity: formData.men_quantity,
      women_quantity: formData.women_quantity,
      datetime_reserved: isoDateTime,
    };

    // Debug: Log form data
    console.log('📝 Form data being sent:', requestData);
    console.log('👤 Selected user:', selectedUser);
    console.log('🏨 Selected hostel:', selectedHostel);
    console.log('🔧 Selected service object:', selectedService);
    console.log('🔧 Hostel-Service ID being sent:', formData.service);
    console.log('🔧 Service ID from object:', selectedService?.service_id);
    console.log('📅 Original datetime:', formData.datetime_reserved);
    console.log('📅 ISO datetime:', isoDateTime);

    try {
      const response = await servicesService.createReservation(requestData);
      console.log('✅ Reservation created successfully:', response.data);
      navigate('/dashboard/services/reservations');
    } catch (err: any) {
      console.error('❌ Error creating reservation:', err);
      console.error('📊 Error response:', err.response?.data);
      console.error('🔍 Error status:', err.response?.status);
      console.error('📝 Error details:', err.response?.data?.details);
      
      // More detailed error handling
      let errorMessage = 'Error al crear la reserva';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.details) {
        errorMessage = `Detalles del error: ${JSON.stringify(err.response.data.details)}`;
      } else if (err.response?.data) {
        errorMessage = `Error del servidor: ${JSON.stringify(err.response.data)}`;
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value,
    }));

    // Si se selecciona un albergue, cargar sus servicios
    if (name === 'hostel' && value) {
      setFormData(prev => ({ ...prev, service: '' })); // Limpiar servicio seleccionado
      loadHostelServices(value);
    }
  };

  const handleUserSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserSearchTerm(value);
    setShowUserSuggestions(value.length > 0);
    
    if (value.length === 0) {
      setSelectedUser(null);
      setFormData(prev => ({ ...prev, user: '' }));
    }
  };

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setUserSearchTerm(user.full_name);
    setFormData(prev => ({ ...prev, user: user.id }));
    setShowUserSuggestions(false);
  };

  const handleHostelSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHostelSearchTerm(value);
    setShowHostelSuggestions(value.length > 0);
    
    if (value.length === 0) {
      setSelectedHostel(null);
      setFormData(prev => ({ ...prev, hostel: '', service: '' }));
      setServices([]); // Limpiar servicios
    }
  };

  const handleHostelSelect = (hostel: Hostel) => {
    setSelectedHostel(hostel);
    setHostelSearchTerm(hostel.name);
    setFormData(prev => ({ ...prev, hostel: hostel.id, service: '' }));
    setShowHostelSuggestions(false);
    loadHostelServices(hostel.id);
  };

  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const filteredHostels = hostels.filter(hostel => 
    hostel.name.toLowerCase().includes(hostelSearchTerm.toLowerCase())
  );

  const selectedService = services.find(s => s.id === formData.service);
  const totalPeople = formData.men_quantity + formData.women_quantity;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Button
          onClick={() => navigate('/dashboard/services/reservations')}
          className="bg-gray-600 hover:bg-gray-700 flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Nueva Reserva de Servicio</h1>
          <p className="text-gray-300 mt-1">Crear una nueva reserva de servicio</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="relative user-autocomplete">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Usuario *
            </label>
            <input
              type="text"
              value={userSearchTerm}
              onChange={handleUserSearch}
              placeholder="Buscar usuario por nombre..."
              className="input-field"
              required
            />
            {showUserSuggestions && filteredUsers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredUsers.slice(0, 10).map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleUserSelect(user)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 text-white border-b border-gray-600 last:border-b-0"
                  >
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-sm text-gray-400">
                      {user.first_name} {user.last_name}
                    </div>
                  </button>
                ))}
                {filteredUsers.length > 10 && (
                  <div className="px-4 py-2 text-sm text-gray-400 text-center">
                    Mostrando 10 de {filteredUsers.length} resultados
                  </div>
                )}
              </div>
            )}
            {showUserSuggestions && filteredUsers.length === 0 && userSearchTerm.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
                <div className="px-4 py-3 text-gray-400 text-center">
                  No se encontraron usuarios
                </div>
              </div>
            )}
          </div>

          <div className="relative hostel-autocomplete">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Albergue *
            </label>
            <input
              type="text"
              value={hostelSearchTerm}
              onChange={handleHostelSearch}
              placeholder="Buscar albergue por nombre..."
              className="input-field"
              required
            />
            {showHostelSuggestions && filteredHostels.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredHostels.slice(0, 10).map((hostel) => (
                  <button
                    key={hostel.id}
                    type="button"
                    onClick={() => handleHostelSelect(hostel)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 text-white border-b border-gray-600 last:border-b-0"
                  >
                    <div className="font-medium">{hostel.name}</div>
                  </button>
                ))}
                {filteredHostels.length > 10 && (
                  <div className="px-4 py-2 text-sm text-gray-400 text-center">
                    Mostrando 10 de {filteredHostels.length} resultados
                  </div>
                )}
              </div>
            )}
            {showHostelSuggestions && filteredHostels.length === 0 && hostelSearchTerm.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
                <div className="px-4 py-3 text-gray-400 text-center">
                  No se encontraron albergues
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Servicio *
            </label>
            <select
              name="service"
              value={formData.service}
              onChange={handleChange}
              required
              disabled={!formData.hostel}
              className="input-field"
            >
              <option value="">
                {!formData.hostel ? 'Primero seleccione un albergue' : 'Seleccionar servicio'}
              </option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - ${service.price}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fecha y Hora de Reserva *
            </label>
            <input
              type="datetime-local"
              name="datetime_reserved"
              value={formData.datetime_reserved}
              onChange={handleChange}
              required
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Reserva *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="input-field"
            >
              <option value="individual">Individual</option>
              <option value="group">Grupal</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cantidad de Hombres
              </label>
              <input
                type="number"
                name="men_quantity"
                value={formData.men_quantity}
                onChange={handleChange}
                min="0"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cantidad de Mujeres
              </label>
              <input
                type="number"
                name="women_quantity"
                value={formData.women_quantity}
                onChange={handleChange}
                min="0"
                className="input-field"
              />
            </div>
          </div>

          {/* El estado siempre es 'pending' para nuevas reservas */}
          <div className="bg-blue-900/20 border border-blue-500 text-blue-200 px-4 py-3 rounded-lg">
            <p className="text-sm">
              <strong>Nota:</strong> Las nuevas reservas se crean automáticamente en estado "Pendiente" y requieren aprobación.
            </p>
          </div>

          {selectedService && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Resumen de la Reserva</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Servicio:</span>
                  <span className="text-white">{selectedService.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Precio:</span>
                  <span className="text-white">${selectedService.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total de personas:</span>
                  <span className="text-white">{totalPeople}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tipo:</span>
                  <span className="text-white">
                    {selectedService.reservation_type === 'individual' ? 'Individual' : 'Grupal'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              loading={saving}
              className="btn-primary"
            >
              Crear Reserva
            </Button>
            <Button
              type="button"
              onClick={() => navigate('/dashboard/services/reservations')}
              className="bg-gray-600 hover:bg-gray-700"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
