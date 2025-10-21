import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { hostelsService, type Hostel, type HostelUpdateData } from '~/lib/api';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import Button from '~/components/ui/Button';
import SimpleMapPicker from '~/components/maps/SimpleMapPicker';
import { 
  ArrowLeftIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export default function EditHostel() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [useMapSelector, setUseMapSelector] = useState(false);
  const [hostel, setHostel] = useState<Hostel | null>(null);

  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        city: location.city,
        state: location.state,
        country: location.country,
        zip_code: location.zipCode,
      }
    }));
  };
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    men_capacity: 0,
    women_capacity: 0,
    is_active: true,
    location: {
      latitude: 0,
      longitude: 0,
      address: '',
      city: '',
      state: '',
      country: 'México',
      zip_code: '',
      landmarks: '',
    },
  });

  const loadHostel = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await hostelsService.getHostel(id);
      const hostelData = response.data;
      setHostel(hostelData);
      
      // Llenar el formulario con los datos existentes
      setFormData({
        name: hostelData.name,
        phone: hostelData.phone,
        men_capacity: hostelData.men_capacity,
        women_capacity: hostelData.women_capacity,
        is_active: hostelData.is_active,
        location: {
          latitude: hostelData.location.latitude,
          longitude: hostelData.location.longitude,
          address: hostelData.location.address,
          city: hostelData.location.city,
          state: hostelData.location.state,
          country: hostelData.location.country,
          zip_code: hostelData.location.zip_code,
          landmarks: hostelData.location.landmarks || '',
        },
      });
    } catch (error: any) {
      console.error('Error loading hostel:', error);
      setError('Error al cargar la información del albergue.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setSaving(true);
    setError('');

    try {
      // Preparar los datos para la actualización
      const updateData: HostelUpdateData = {
        name: formData.name,
        phone: formData.phone,
        men_capacity: formData.men_capacity,
        women_capacity: formData.women_capacity,
        is_active: formData.is_active,
        location: {
          latitude: formData.location.latitude,
          longitude: formData.location.longitude,
          address: formData.location.address,
          city: formData.location.city,
          state: formData.location.state,
          country: formData.location.country,
          zip_code: formData.location.zip_code,
          landmarks: formData.location.landmarks,
        },
      };
      
      await hostelsService.updateHostel(id, updateData);
      navigate(`/dashboard/hostels/detail/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar el albergue');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value,
      }));
    }
  };

  useEffect(() => {
    loadHostel();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !hostel) {
    return (
      <div className="px-4 sm:px-0">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Link to="/dashboard/hostels/list" className="btn-primary">
            Volver a la Lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link 
            to={`/dashboard/hostels/detail/${id}`} 
            className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-white" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Editar Albergue</h1>
            <p className="text-gray-300 mt-1">Modificar información del albergue</p>
          </div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="border-b border-gray-700 pb-4">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <BuildingOfficeIcon className="w-6 h-6 text-blue-400" />
              Información General
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nombre del Albergue *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Nombre del albergue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="+52 81 1234 5678"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Capacidad Hombres *
                </label>
                <input
                  type="number"
                  name="men_capacity"
                  value={formData.men_capacity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Capacidad Mujeres *
                </label>
                <input
                  type="number"
                  name="women_capacity"
                  value={formData.women_capacity}
                  onChange={handleChange}
                  required
                  min="0"
                  className="input-field"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="rounded"
                />
                <span className="text-gray-300">Albergue activo</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <MapPinIcon className="w-6 h-6 text-red-400" />
                Ubicación
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUseMapSelector(true)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    useMapSelector 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  🗺️ Mapa
                </button>
                <button
                  type="button"
                  onClick={() => setUseMapSelector(false)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    !useMapSelector 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  ✏️ Manual
                </button>
              </div>
            </div>
            
            <SimpleMapPicker
              onLocationSelect={handleLocationSelect}
              initialLocation={{
                latitude: formData.location.latitude,
                longitude: formData.location.longitude
              }}
              height="400px"
              showMap={useMapSelector}
            />
            {!useMapSelector && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Latitud *
                    </label>
                    <input
                      type="number"
                      name="location.latitude"
                      value={formData.location.latitude}
                      onChange={handleChange}
                      required
                      step="any"
                      className="input-field"
                      placeholder="25.6866"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Longitud *
                    </label>
                    <input
                      type="number"
                      name="location.longitude"
                      value={formData.location.longitude}
                      onChange={handleChange}
                      required
                      step="any"
                      className="input-field"
                      placeholder="-100.3161"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    name="location.address"
                    value={formData.location.address}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Calle y número"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="Monterrey"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Estado *
                    </label>
                    <input
                      type="text"
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="Nuevo León"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      name="location.zip_code"
                      value={formData.location.zip_code}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="64000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Referencias (opcional)
                  </label>
                  <textarea
                    name="location.landmarks"
                    value={formData.location.landmarks}
                    onChange={handleChange}
                    rows={3}
                    className="input-field"
                    placeholder="Referencias o puntos de interés cercanos"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              loading={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
            <Button
              type="button"
              onClick={() => navigate(`/dashboard/hostels/detail/${id}`)}
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
