import { useState } from 'react';
import { useNavigate } from 'react-router';
import { hostelsService, type HostelCreateData } from '~/lib/api';
import Button from '~/components/ui/Button';
import SimpleMapPicker from '~/components/maps/SimpleMapPicker';
import { extractCoordinatesFromGoogleMaps, isValidGoogleMapsUrl } from '~/lib/googleMapsUtils';

export default function NewHostel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    men_capacity: 0,
    women_capacity: 0,
    is_active: true,
    image_url: '',
    location: {
      latitude: 25.6866, // Monterrey por defecto
      longitude: -100.3161, // Monterrey por defecto
      address: '',
      city: '',
      state: '',
      country: 'México',
      zip_code: '',
      landmarks: '',
    },
  });
  const [useMapSelector, setUseMapSelector] = useState(true);
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [processingUrl, setProcessingUrl] = useState(false);

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

  const handleGoogleMapsUrlChange = async (url: string) => {
    setGoogleMapsUrl(url);
    
    if (url && isValidGoogleMapsUrl(url)) {
      setProcessingUrl(true);
      try {
        const coordinates = await extractCoordinatesFromGoogleMaps(url);
        if (coordinates) {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
            }
          }));
          setUseMapSelector(true); // Cambiar al modo mapa para mostrar la ubicación
        }
      } catch (error) {
        console.error('Error extracting coordinates:', error);
      } finally {
        setProcessingUrl(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validar campos requeridos
      if (!formData.name.trim()) {
        setError('El nombre del albergue es requerido');
        return;
      }
      if (!formData.phone.trim()) {
        setError('El teléfono es requerido');
        return;
      }
      if (!formData.location.address.trim()) {
        setError('La dirección es requerida');
        return;
      }
      if (!formData.location.city.trim()) {
        setError('La ciudad es requerida');
        return;
      }
      if (!formData.location.state.trim()) {
        setError('El estado es requerido');
        return;
      }
      if (!formData.location.zip_code.trim()) {
        setError('El código postal es requerido');
        return;
      }

      // Validar formato del teléfono
      const phonePattern = /^\+\d{10,15}$/;
      if (!phonePattern.test(formData.phone)) {
        setError('El teléfono debe tener el formato +52811908593 (mínimo 10 dígitos, máximo 15)');
        return;
      }

      // Preparar los datos para la creación
      const createData: HostelCreateData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        men_capacity: formData.men_capacity,
        women_capacity: formData.women_capacity,
        is_active: formData.is_active,
        image_url: formData.image_url.trim() || undefined,
        location: {
          latitude: formData.location.latitude.toFixed(6), // Limitar a 6 decimales
          longitude: formData.location.longitude.toFixed(6), // Limitar a 6 decimales
          address: formData.location.address.trim(),
          city: formData.location.city.trim(),
          state: formData.location.state.trim(),
          country: formData.location.country.trim(),
          zip_code: formData.location.zip_code.trim(),
          landmarks: formData.location.landmarks?.trim() || '',
        },
      };
      
      await hostelsService.createHostel(createData);
      navigate('/dashboard/hostels/list');
    } catch (err: any) {
      console.error('Error creating hostel:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al crear albergue';
      setError(errorMessage);
    } finally {
      setLoading(false);
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

  return (
    <div className="px-4 sm:px-0 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Nuevo Albergue</h1>
        <p className="text-gray-300 mt-2">Registrar un nuevo albergue en el sistema</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="border-b border-gray-700 pb-4">
            <h2 className="text-xl font-semibold text-white mb-4">Información General</h2>
            
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

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL de la Imagen
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="input-field"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <p className="text-xs text-gray-400 mt-1">
                URL de la imagen que representará al albergue (opcional)
              </p>
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
              <h2 className="text-xl font-semibold text-white">Ubicación</h2>
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

            {/* Campo para enlace de Google Maps */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enlace de Google Maps (opcional)
              </label>
              <input
                type="url"
                value={googleMapsUrl}
                onChange={(e) => handleGoogleMapsUrlChange(e.target.value)}
                placeholder="Ejemplo: https://www.google.com/maps?q=19.432600,-99.133200"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
              />
              {processingUrl && (
                <p className="text-blue-400 text-sm mt-1">
                  🔄 Procesando enlace y extrayendo coordenadas...
                </p>
              )}
              {googleMapsUrl && !isValidGoogleMapsUrl(googleMapsUrl) && !processingUrl && (
                <p className="text-red-400 text-sm mt-1">
                  Por favor ingresa un enlace válido de Google Maps
                </p>
              )}
              {googleMapsUrl && (googleMapsUrl.includes('goo.gl') || googleMapsUrl.includes('maps.app.goo.gl')) && (
                <p className="text-yellow-400 text-sm mt-1">
                  ⚠️ Los enlaces acortados (goo.gl, maps.app.goo.gl) no se pueden procesar automáticamente. 
                  Por favor, usa un enlace completo de Google Maps o selecciona la ubicación manualmente en el mapa.
                </p>
              )}
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
              loading={loading}
              className="btn-primary"
            >
              Crear Albergue
            </Button>
            <Button
              type="button"
              onClick={() => navigate('/dashboard/hostels/list')}
              className="btn-secondary"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}