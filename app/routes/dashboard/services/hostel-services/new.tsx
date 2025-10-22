import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { servicesService, hostelsService, type Service } from '~/lib/api';
import Button from '~/components/ui/Button';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';


interface Hostel {
  id: string;
  name: string;
  location: string;
}

interface Schedule {
  id: string;
  day_of_week: number;
  day_name: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  is_available: boolean;
}

export default function NewHostelService() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [services, setServices] = useState<Service[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showServiceSuggestions, setShowServiceSuggestions] = useState(false);
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    hostel: '',
    service: '',
    schedule: '',
    is_active: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [servicesResponse, hostelsResponse, schedulesResponse] = await Promise.all([
        servicesService.getServices({ page_size: 100 }),
        hostelsService.getHostels({ page_size: 100 }),
        servicesService.getSchedules({ page_size: 100 })
      ]);
      
      setServices(servicesResponse.data.results);
      setHostels(hostelsResponse.data.results);
      setSchedules(schedulesResponse.data.results);
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError('Error al cargar los datos necesarios');
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
      if (!target.closest('.service-autocomplete')) {
        setShowServiceSuggestions(false);
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
    if (!formData.hostel) {
      setError('Debe seleccionar un albergue');
      setSaving(false);
      return;
    }

    if (!formData.service) {
      setError('Debe seleccionar un servicio');
      setSaving(false);
      return;
    }

    if (!formData.schedule) {
      setError('Debe seleccionar un horario');
      setSaving(false);
      return;
    }

    // Debug: Log form data
    console.log('📝 Form data being sent:', formData);
    console.log('🏨 Selected hostel:', hostels.find(h => h.id === formData.hostel));
    console.log('🔧 Selected service:', selectedService);
    console.log('⏰ Selected schedule:', schedules.find(s => s.id === formData.schedule));

    try {
      const response = await servicesService.createHostelService(formData);
      console.log('✅ Hostel service created successfully:', response.data);
      navigate('/dashboard/services/hostel-services');
    } catch (err: any) {
      console.error('❌ Error creating hostel service:', err);
      console.error('📊 Error response:', err.response?.data);
      console.error('🔍 Error status:', err.response?.status);
      console.error('📝 Error details:', err.response?.data?.details);
      
      // More detailed error handling
      let errorMessage = 'Error al crear el servicio de albergue';
      
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
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleServiceSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setServiceSearchTerm(value);
    setShowServiceSuggestions(value.length > 0);
    
    if (value.length === 0) {
      setSelectedService(null);
      setFormData(prev => ({ ...prev, service: '' }));
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setServiceSearchTerm(service.name);
    setFormData(prev => ({ ...prev, service: service.id }));
    setShowServiceSuggestions(false);
  };

  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(serviceSearchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6 flex items-center gap-4">
        <Button
          onClick={() => navigate('/dashboard/services/hostel-services')}
          className="bg-gray-600 hover:bg-gray-700 flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Nuevo Servicio de Albergue</h1>
          <p className="text-gray-300 mt-1">Asignar un servicio a un albergue específico</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Albergue *
              </label>
              <select
                name="hostel"
                value={formData.hostel}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Seleccionar albergue</option>
                {hostels.map((hostel) => (
                  <option key={hostel.id} value={hostel.id}>
                    {hostel.name} - {hostel.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative service-autocomplete">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Servicio *
              </label>
              <input
                type="text"
                value={serviceSearchTerm}
                onChange={handleServiceSearch}
                placeholder="Buscar servicio por nombre..."
                className="input-field"
                required
              />
              {showServiceSuggestions && filteredServices.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredServices.slice(0, 10).map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleServiceSelect(service)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-700 text-white border-b border-gray-600 last:border-b-0"
                    >
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-400">{service.description}</div>
                      <div className="text-sm text-gray-400">${service.price}</div>
                    </button>
                  ))}
                  {filteredServices.length > 10 && (
                    <div className="px-4 py-2 text-sm text-gray-400 text-center">
                      Mostrando 10 de {filteredServices.length} resultados
                    </div>
                  )}
                </div>
              )}
              {showServiceSuggestions && filteredServices.length === 0 && serviceSearchTerm.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
                  <div className="px-4 py-3 text-gray-400 text-center">
                    No se encontraron servicios
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Horario *
              </label>
              <select
                name="schedule"
                value={formData.schedule}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Seleccionar horario</option>
                {schedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.day_name} - {schedule.start_time} a {schedule.end_time} ({schedule.duration_hours}h)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-300">
                Servicio activo
              </label>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={saving}
                className="btn-primary flex-1"
              >
                {saving ? 'Creando...' : 'Crear Servicio de Albergue'}
              </Button>
              <Button
                type="button"
                onClick={() => navigate('/dashboard/services/hostel-services')}
                className="btn-secondary"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
