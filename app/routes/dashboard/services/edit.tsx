import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { servicesService, type Service } from '~/lib/api';
import Button from '~/components/ui/Button';
import LoadingSpinner from '~/components/ui/LoadingSpinner';

export default function EditService() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [service, setService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    reservation_type: 'individual' as 'individual' | 'group',
    needs_approval: false,
    max_time: 60,
    is_active: true,
  });

  const loadService = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await servicesService.getService(id);
      setService(response.data);
      setFormData({
        name: response.data.name,
        description: response.data.description,
        price: response.data.price,
        reservation_type: response.data.reservation_type,
        needs_approval: response.data.needs_approval,
        max_time: response.data.max_time,
        is_active: response.data.is_active,
      });
    } catch (error: any) {
      console.error('Error loading service:', error);
      setError('Error al cargar el servicio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadService();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setSaving(true);
    setError('');

    try {
      await servicesService.updateService(id, formData);
      navigate('/dashboard/services/list');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar servicio');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="px-4 sm:px-0">
        <div className="text-center py-12">
          <p className="text-gray-400">Servicio no encontrado</p>
          <Button
            onClick={() => navigate('/dashboard/services/list')}
            className="mt-4 bg-gray-600 hover:bg-gray-700"
          >
            Volver a Servicios
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Editar Servicio</h1>
        <p className="text-gray-300 mt-2">Modificar los datos del servicio</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre del Servicio *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Ej: Comedor, Duchas, Lavandería"
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
              rows={4}
              className="input-field"
              placeholder="Describe el servicio que se ofrece"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Precio *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="input-field"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tiempo Máximo (minutos) *
              </label>
              <input
                type="number"
                name="max_time"
                value={formData.max_time}
                onChange={handleChange}
                required
                min="1"
                className="input-field"
                placeholder="60"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Reserva *
            </label>
            <select
              name="reservation_type"
              value={formData.reservation_type}
              onChange={handleChange}
              className="input-field"
            >
              <option value="individual">Individual</option>
              <option value="group">Grupal</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="needs_approval"
                checked={formData.needs_approval}
                onChange={handleChange}
                className="rounded"
              />
              <span className="text-gray-300">Requiere aprobación del administrador</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="rounded"
              />
              <span className="text-gray-300">Servicio activo</span>
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              loading={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              Actualizar Servicio
            </Button>
            <Button
              type="button"
              onClick={() => navigate('/dashboard/services/list')}
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
