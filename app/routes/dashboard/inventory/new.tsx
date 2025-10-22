import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { inventoryService, hostelsService, type Inventory, type Hostel } from '~/lib/api';
import Button from '~/components/ui/Button';

export default function NewInventory() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [hostelSearch, setHostelSearch] = useState('');
  const [filteredHostels, setFilteredHostels] = useState<Hostel[]>([]);
  const [showHostelDropdown, setShowHostelDropdown] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [formData, setFormData] = useState({
    hostel: '',
    name: '',
    description: '',
    is_active: true,
  });

  const loadHostels = async () => {
    try {
      const response = await hostelsService.getHostels();
      setHostels(response.data.results);
    } catch (error: any) {
      console.error('Error loading hostels:', error);
      
      // Mostrar detalles específicos del error
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        
        if (error.response.status === 400) {
          console.error('Bad Request - Validation errors:', error.response.data);
        } else if (error.response.status === 401) {
          console.error('Unauthorized - Authentication required');
        } else if (error.response.status === 403) {
          console.error('Forbidden - Insufficient permissions');
        } else if (error.response.status === 404) {
          console.error('Not Found - Hostels not found');
        } else if (error.response.status === 500) {
          console.error('Internal Server Error - Server issue');
        }
      } else if (error.request) {
        console.error('Network error - No response received:', error.request);
      } else {
        console.error('Request setup error:', error.message);
      }
    }
  };

  // Filtrar albergues basado en la búsqueda
  useEffect(() => {
    if (hostelSearch.trim() === '') {
      setFilteredHostels([]);
      setShowHostelDropdown(false);
    } else {
      const filtered = hostels.filter(hostel =>
        hostel.name.toLowerCase().includes(hostelSearch.toLowerCase())
      );
      setFilteredHostels(filtered);
      setShowHostelDropdown(filtered.length > 0);
    }
  }, [hostelSearch, hostels]);

  useEffect(() => {
    loadHostels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await inventoryService.createInventory(formData);
      navigate('/dashboard/inventory/list');
    } catch (err: any) {
      console.error('Error creating inventory:', err);
      
      // Mostrar detalles específicos del error
      if (err.response) {
        console.error('Error response status:', err.response.status);
        console.error('Error response data:', err.response.data);
        
        if (err.response.status === 400) {
          console.error('Bad Request - Validation errors:', err.response.data);
          // Mostrar errores de validación específicos
          if (err.response.data && typeof err.response.data === 'object') {
            const validationErrors = Object.entries(err.response.data)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join('; ');
            setError(`Errores de validación: ${validationErrors}`);
          } else {
            setError(err.response.data?.message || 'Error de validación en los datos enviados');
          }
        } else if (err.response.status === 401) {
          console.error('Unauthorized - Authentication required');
          setError('No autorizado - Inicia sesión nuevamente');
        } else if (err.response.status === 403) {
          console.error('Forbidden - Insufficient permissions');
          setError('Sin permisos suficientes para crear inventarios');
        } else if (err.response.status === 404) {
          console.error('Not Found - Endpoint not available');
          setError('Servicio no disponible');
        } else if (err.response.status === 500) {
          console.error('Internal Server Error - Server issue');
          setError('Error del servidor - Intenta nuevamente');
        } else {
          setError(err.response.data?.message || 'Error al crear inventario');
        }
      } else if (err.request) {
        console.error('Network error - No response received:', err.request);
        setError('Error de conexión - Verifica tu internet');
      } else {
        console.error('Request setup error:', err.message);
        setError('Error de configuración de la solicitud');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleHostelSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHostelSearch(value);
    setFormData(prev => ({ ...prev, hostel: '' }));
    setSelectedHostel(null);
  };

  const handleHostelSelect = (hostel: Hostel) => {
    setSelectedHostel(hostel);
    setHostelSearch(hostel.name);
    setFormData(prev => ({ ...prev, hostel: hostel.id }));
    setShowHostelDropdown(false);
  };

  const handleHostelInputFocus = () => {
    if (hostelSearch.trim() !== '') {
      setShowHostelDropdown(filteredHostels.length > 0);
    }
  };

  const handleHostelInputBlur = () => {
    // Delay para permitir que el click en la opción se ejecute
    setTimeout(() => {
      setShowHostelDropdown(false);
    }, 200);
  };

  return (
    <div className="px-4 sm:px-0 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Nuevo Inventario</h1>
        <p className="text-gray-300 mt-2">Crear un nuevo inventario para un albergue</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Albergue *
            </label>
            <input
              type="text"
              value={hostelSearch}
              onChange={handleHostelSearch}
              onFocus={handleHostelInputFocus}
              onBlur={handleHostelInputBlur}
              placeholder="Buscar albergue..."
              required
              className="input-field w-full"
            />
            {showHostelDropdown && filteredHostels.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredHostels.map((hostel) => (
                  <div
                    key={hostel.id}
                    onClick={() => handleHostelSelect(hostel)}
                    className="px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                  >
                    <div className="text-white font-medium">{hostel.name}</div>
                    {hostel.location_data?.address && (
                      <div className="text-gray-400 text-sm">{hostel.location_data.address}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {hostelSearch.trim() !== '' && filteredHostels.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
                <div className="px-4 py-3 text-gray-400">
                  No se encontraron albergues
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre del Inventario *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Ej: Inventario Principal, Inventario de Emergencia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="input-field"
              placeholder="Descripción del inventario y su propósito"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="rounded"
              />
              <span className="text-gray-300">Inventario activo</span>
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              loading={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              Crear Inventario
            </Button>
            <Button
              type="button"
              onClick={() => navigate('/dashboard/inventory/list')}
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