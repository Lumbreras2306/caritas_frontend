import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { inventoryService, type InventoryItem } from '~/lib/api';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function InventoryList() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const params: any = { search: searchTerm };
      if (categoryFilter) params.category = categoryFilter;
      
      const response = await inventoryService.getItems(params);
      setItems(response.data.results);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await inventoryService.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadItems();
  }, [searchTerm, categoryFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este artículo?')) return;
    
    try {
      await inventoryService.deleteItem(id);
      loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Artículos de Inventario</h1>
        <Link to="/dashboard/inventory/new" className="btn-primary">
          Nuevo Artículo
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar artículos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-field"
        >
          <option value="">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-white">Nombre</th>
                <th className="px-4 py-3 text-left text-white">Categoría</th>
                <th className="px-4 py-3 text-left text-white">Unidad</th>
                <th className="px-4 py-3 text-left text-white">Estado</th>
                <th className="px-4 py-3 text-left text-white">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-medium">{item.name}</p>
                      <p className="text-gray-400 text-sm">{item.description}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{item.unit}</td>
                  <td className="px-4 py-3">
                    {item.is_active ? (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        to={`/dashboard/inventory/edit/${item.id}`}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No se encontraron artículos</p>
        </div>
      )}
    </div>
  );
}