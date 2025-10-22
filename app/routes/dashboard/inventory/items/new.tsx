import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { inventoryService, type InventoryItem } from '~/lib/api';
import Button from '~/components/ui/Button';
import LoadingSpinner from '~/components/ui/LoadingSpinner';

export default function NewInventoryItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [formData, setFormData] = useState({
    inventory: id || '',
    item: '',
    quantity: 0,
    minimum_stock: 0,
  });

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getItems();
      setItems(response.data.results);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setSaving(true);
    setError('');

    try {
      await inventoryService.createInventoryItem(formData);
      navigate(`/dashboard/inventory/detail/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al agregar artículo al inventario');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
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
        <h1 className="text-3xl font-bold text-white">Agregar Artículo al Inventario</h1>
        <p className="text-gray-300 mt-2">Agregar un artículo existente al inventario</p>
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
              Artículo *
            </label>
            <select
              name="item"
              value={formData.item}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="">Seleccionar artículo</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} - {item.category} ({item.unit})
                </option>
              ))}
            </select>
            <p className="text-gray-400 text-sm mt-1">
              Selecciona un artículo del catálogo para agregarlo al inventario
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cantidad Inicial *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                className="input-field"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stock Mínimo *
              </label>
              <input
                type="number"
                name="minimum_stock"
                value={formData.minimum_stock}
                onChange={handleChange}
                required
                min="0"
                className="input-field"
                placeholder="0"
              />
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h4 className="text-blue-200 font-medium mb-2">Información del Artículo</h4>
            {formData.item && items.find(item => item.id === formData.item) && (
              <div className="text-sm text-blue-100">
                <p><strong>Nombre:</strong> {items.find(item => item.id === formData.item)?.name}</p>
                <p><strong>Descripción:</strong> {items.find(item => item.id === formData.item)?.description}</p>
                <p><strong>Categoría:</strong> {items.find(item => item.id === formData.item)?.category}</p>
                <p><strong>Unidad:</strong> {items.find(item => item.id === formData.item)?.unit}</p>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              loading={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              Agregar al Inventario
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
