import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { inventoryService, type InventoryItemDetail } from '~/lib/api';
import Button from '~/components/ui/Button';
import LoadingSpinner from '~/components/ui/LoadingSpinner';

export default function EditInventoryItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [inventoryItem, setInventoryItem] = useState<InventoryItemDetail | null>(null);
  const [formData, setFormData] = useState({
    quantity: 0,
    minimum_stock: 0,
  });

  const loadInventoryItem = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await inventoryService.getInventoryItem(id);
      const item = response.data;
      
      setInventoryItem(item);
      setFormData({
        quantity: item.quantity,
        minimum_stock: item.minimum_stock,
      });
    } catch (error) {
      console.error('Error loading inventory item:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventoryItem();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setSaving(true);
    setError('');

    try {
      await inventoryService.updateInventoryItem(id, formData);
      navigate(`/dashboard/inventory/detail/${inventoryItem?.inventory}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar artículo');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleQuantityUpdate = async (action: 'add' | 'subtract', amount: number) => {
    if (!id) return;
    
    try {
      await inventoryService.updateQuantity(id, { action, amount });
      loadInventoryItem(); // Recargar datos
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar cantidad');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!inventoryItem) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Artículo no encontrado</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Editar Artículo en Inventario</h1>
        <p className="text-gray-300 mt-2">Actualizar cantidad y stock mínimo del artículo</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Información del artículo */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-white font-medium mb-3">Información del Artículo</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-300"><strong>Nombre:</strong> {inventoryItem.item.name}</p>
                <p className="text-gray-300"><strong>Descripción:</strong> {inventoryItem.item.description}</p>
              </div>
              <div>
                <p className="text-gray-300"><strong>Categoría:</strong> {inventoryItem.item.category}</p>
                <p className="text-gray-300"><strong>Unidad:</strong> {inventoryItem.item.unit}</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cantidad Actual *
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

          {/* Acciones rápidas de cantidad */}
          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <h4 className="text-blue-200 font-medium mb-3">Acciones Rápidas</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Agregar Cantidad
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    id="addAmount"
                    min="1"
                    className="input-field flex-1"
                    placeholder="Cantidad"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const amount = (document.getElementById('addAmount') as HTMLInputElement)?.value;
                      if (amount) {
                        handleQuantityUpdate('add', Number(amount));
                        (document.getElementById('addAmount') as HTMLInputElement).value = '';
                      }
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Agregar
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Restar Cantidad
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    id="subtractAmount"
                    min="1"
                    className="input-field flex-1"
                    placeholder="Cantidad"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const amount = (document.getElementById('subtractAmount') as HTMLInputElement)?.value;
                      if (amount) {
                        handleQuantityUpdate('subtract', Number(amount));
                        (document.getElementById('subtractAmount') as HTMLInputElement).value = '';
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Restar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              loading={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              Actualizar Artículo
            </Button>
            <Button
              type="button"
              onClick={() => navigate(`/dashboard/inventory/detail/${inventoryItem.inventory}`)}
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
