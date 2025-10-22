import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { inventoryService, type Item } from '~/lib/api';
import Button from '~/components/ui/Button';
import LoadingSpinner from '~/components/ui/LoadingSpinner';

export default function NewInventoryItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [itemSearch, setItemSearch] = useState('');
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
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
    } catch (error: any) {
      console.error('Error loading items:', error);
      
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
          console.error('Not Found - Items not found');
        } else if (error.response.status === 500) {
          console.error('Internal Server Error - Server issue');
        }
      } else if (error.request) {
        console.error('Network error - No response received:', error.request);
      } else {
        console.error('Request setup error:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filtrar artículos basado en la búsqueda
  useEffect(() => {
    if (itemSearch.trim() === '') {
      setFilteredItems([]);
      setShowItemDropdown(false);
    } else {
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.description.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(itemSearch.toLowerCase())
      );
      setFilteredItems(filtered);
      setShowItemDropdown(filtered.length > 0);
    }
  }, [itemSearch, items]);

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

  const handleItemSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setItemSearch(value);
    setFormData(prev => ({ ...prev, item: '' }));
    setSelectedItem(null);
  };

  const handleItemSelect = (item: Item) => {
    setSelectedItem(item);
    setItemSearch(item.name);
    setFormData(prev => ({ ...prev, item: item.id }));
    setShowItemDropdown(false);
  };

  const handleItemInputFocus = () => {
    if (itemSearch.trim() !== '') {
      setShowItemDropdown(filteredItems.length > 0);
    }
  };

  const handleItemInputBlur = () => {
    // Delay para permitir que el click en la opción se ejecute
    setTimeout(() => {
      setShowItemDropdown(false);
    }, 200);
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

          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Artículo *
            </label>
            <input
              type="text"
              value={itemSearch}
              onChange={handleItemSearch}
              onFocus={handleItemInputFocus}
              onBlur={handleItemInputBlur}
              placeholder="Buscar artículo..."
              required
              className="input-field w-full"
            />
            {showItemDropdown && filteredItems.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemSelect(item)}
                    className="px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0"
                  >
                    <div className="text-white font-medium">{item.name}</div>
                    <div className="text-gray-400 text-sm">
                      {item.description && `${item.description} • `}
                      {item.category} • {item.unit}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {itemSearch.trim() !== '' && filteredItems.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
                <div className="px-4 py-3 text-gray-400">
                  No se encontraron artículos
                </div>
              </div>
            )}
            <p className="text-gray-400 text-sm mt-1">
              Busca un artículo por nombre, descripción o categoría
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
