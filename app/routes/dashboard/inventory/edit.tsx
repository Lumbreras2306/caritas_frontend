import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { inventoryService, type Inventory } from '~/lib/api';
import Button from '~/components/ui/Button';
import LoadingSpinner from '~/components/ui/LoadingSpinner';

export default function EditInventory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hostels, setHostels] = useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = useState({
    hostel: '',
    name: '',
    description: '',
    is_active: true,
  });

  const loadInventory = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await inventoryService.getInventory(id);
      const inventory = response.data;
      
      setFormData({
        hostel: inventory.hostel,
        name: inventory.name,
        description: inventory.description,
        is_active: inventory.is_active,
      });
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHostels = async () => {
    try {
      // Aquí deberías cargar los albergues desde el servicio correspondiente
      // Por ahora usamos datos mock
      setHostels([
        { id: '1', name: 'Casa San José' },
        { id: '2', name: 'Albergue San Juan' },
        { id: '3', name: 'Refugio San Pedro' }
      ]);
    } catch (error) {
      console.error('Error loading hostels:', error);
    }
  };

  useEffect(() => {
    loadHostels();
    loadInventory();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setSaving(true);
    setError('');

    try {
      await inventoryService.updateInventory(id, formData);
      navigate(`/dashboard/inventory/detail/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar inventario');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Editar Inventario</h1>
        <p className="text-gray-300 mt-2">Modificar información del inventario</p>
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
                  {hostel.name}
                </option>
              ))}
            </select>
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
              loading={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              Actualizar Inventario
            </Button>
            <Button
              type="button"
              onClick={() => navigate(`/dashboard/inventory/detail/${id}`)}
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
