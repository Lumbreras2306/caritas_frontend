import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { inventoryService, type Item } from '~/lib/api';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function InventoryItems() {
  const [items, setItems] = useState<Item[]>([]);
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

  const loadCategories = async () => {
    try {
      const response = await inventoryService.getCategories();
      console.log('Categories response:', response.data);
      
      // Manejar diferentes estructuras de respuesta
      let categoriesData: string[] = [];
      const responseData = response.data as any;
      
      if (Array.isArray(responseData)) {
        categoriesData = responseData;
      } else if (responseData && Array.isArray(responseData.results)) {
        categoriesData = responseData.results;
      } else if (responseData && Array.isArray(responseData.categories)) {
        categoriesData = responseData.categories;
      } else {
        console.warn('Unexpected categories response structure:', responseData);
        categoriesData = [];
      }
      
      setCategories(categoriesData);
    } catch (error: any) {
      console.error('Error loading categories:', error);
      
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
          console.error('Not Found - Categories not found');
        } else if (error.response.status === 500) {
          console.error('Internal Server Error - Server issue');
        }
      } else if (error.request) {
        console.error('Network error - No response received:', error.request);
      } else {
        console.error('Request setup error:', error.message);
      }
      
      // Establecer array vacío en caso de error
      setCategories([]);
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
        <div>
          <h1 className="text-3xl font-bold text-white">Catálogo de Artículos</h1>
          <p className="text-gray-300 mt-2">Gestionar el catálogo de artículos disponibles</p>
        </div>
        <Link to="/dashboard/inventory/items/new-item" className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Nuevo Artículo
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
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
          {Array.isArray(categories) && categories.map((category) => (
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
                <th className="px-4 py-3 text-left text-white">Artículo</th>
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
                        to={`/dashboard/inventory/items/edit/${item.id}`}
                        className="text-yellow-400 hover:text-yellow-300"
                        title="Editar artículo"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 hover:text-red-300"
                        title="Eliminar artículo"
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
