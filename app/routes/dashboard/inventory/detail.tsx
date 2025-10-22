import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { inventoryService, type Inventory, type InventoryItem } from '~/lib/api';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { 
  PencilIcon, 
  PlusIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  CubeIcon,
  BuildingOfficeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function InventoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalValue: 0
  });

  const loadInventory = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Cargar inventario
      const inventoryResponse = await inventoryService.getInventory(id);
      setInventory(inventoryResponse.data);
      
      // Cargar artículos del inventario
      const itemsResponse = await inventoryService.getInventoryItems({ inventory: id });
      setItems(itemsResponse.data.results);
      
      // Calcular estadísticas
      const lowStockItems = itemsResponse.data.results.filter(item => 
        item.quantity <= item.minimum_stock
      );
      const outOfStockItems = itemsResponse.data.results.filter(item => 
        item.quantity === 0
      );
      
      setStats({
        totalItems: itemsResponse.data.results.length,
        lowStockCount: lowStockItems.length,
        outOfStockCount: outOfStockItems.length,
        totalValue: itemsResponse.data.results.reduce((sum, item) => sum + (item.quantity * 1), 0) // Asumiendo valor unitario de 1
      });
      
    } catch (error: any) {
      console.error('Error loading inventory:', error);
      
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
          console.error('Not Found - Inventory not found');
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

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      setDeleting(true);
      await inventoryService.deleteInventory(id);
      navigate('/dashboard/inventory');
    } catch (error: any) {
      console.error('Error deleting inventory:', error);
      
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
          console.error('Not Found - Inventory not found');
        } else if (error.response.status === 500) {
          console.error('Internal Server Error - Server issue');
        }
      } else if (error.request) {
        console.error('Network error - No response received:', error.request);
      } else {
        console.error('Request setup error:', error.message);
      }
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Filtrar artículos basado en la búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item =>
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.item_category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
    }
  }, [searchTerm, items]);

  useEffect(() => {
    loadInventory();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Inventario no encontrado</p>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white">{inventory.name}</h1>
            <p className="text-gray-300 mt-2">{inventory.description}</p>
            <p className="text-gray-400 text-sm mt-1">Albergue: {inventory.hostel_name}</p>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/dashboard/inventory/edit/${inventory.id}`}
              className="btn-secondary flex items-center gap-2"
            >
              <PencilIcon className="w-5 h-5" />
              Editar
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn-danger flex items-center gap-2"
            >
              <TrashIcon className="w-5 h-5" />
              Eliminar
            </button>
            <Link
              to={`/dashboard/inventory/${inventory.id}/items/new`}
              className="btn-primary flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Agregar Artículo
            </Link>
          </div>
        </div>
      </div>

      {/* Estadísticas del inventario */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-600 rounded-lg">
              <CubeIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Total Artículos</p>
              <p className="text-2xl font-bold text-white">{stats.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-600 rounded-lg">
              <ExclamationTriangleIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Stock Bajo</p>
              <p className="text-2xl font-bold text-white">{stats.lowStockCount}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-red-600 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Sin Stock</p>
              <p className="text-2xl font-bold text-white">{stats.outOfStockCount}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-600 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-300">Estado</p>
              <p className={`text-lg font-bold ${
                inventory.is_active ? 'text-green-400' : 'text-red-400'
              }`}>
                {inventory.is_active ? 'Activo' : 'Inactivo'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de artículos */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Artículos del Inventario</h3>
          <Link
            to={`/dashboard/inventory/${inventory.id}/items/new`}
            className="btn-primary flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Agregar Artículo
          </Link>
        </div>

        {/* Campo de búsqueda */}
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar artículos por nombre, descripción o categoría..."
            className="input-field w-full"
          />
          {searchTerm && (
            <div className="mt-2 text-sm text-gray-400">
              Mostrando {filteredItems.length} de {items.length} artículos
            </div>
          )}
        </div>

        {filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-white">Artículo</th>
                  <th className="px-4 py-3 text-left text-white">Categoría</th>
                  <th className="px-4 py-3 text-left text-white">Cantidad</th>
                  <th className="px-4 py-3 text-left text-white">Stock Mínimo</th>
                  <th className="px-4 py-3 text-left text-white">Estado</th>
                  <th className="px-4 py-3 text-left text-white">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-medium">{item.item_name}</p>
                        <p className="text-gray-400 text-sm">{item.item_description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                        {item.item_category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${
                        item.quantity === 0 
                          ? 'text-red-400' 
                          : item.quantity <= item.minimum_stock 
                            ? 'text-yellow-400' 
                            : 'text-green-400'
                      }`}>
                        {item.quantity} {item.item_unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {item.minimum_stock} {item.item_unit}
                    </td>
                    <td className="px-4 py-3">
                      {item.quantity === 0 ? (
                        <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                          Sin Stock
                        </span>
                      ) : item.quantity <= item.minimum_stock ? (
                        <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">
                          Stock Bajo
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          to={`/dashboard/inventory/items/${item.id}/edit`}
                          className="text-yellow-400 hover:text-yellow-300"
                          title="Editar cantidad"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            {searchTerm ? (
              <div>
                <p className="text-gray-400 mb-4">No se encontraron artículos que coincidan con "{searchTerm}"</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="btn-secondary mr-2"
                >
                  Limpiar búsqueda
                </button>
                <Link
                  to={`/dashboard/inventory/${inventory.id}/items/new`}
                  className="btn-primary"
                >
                  Agregar Artículo
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-gray-400 mb-4">No hay artículos en este inventario</p>
                <Link
                  to={`/dashboard/inventory/${inventory.id}/items/new`}
                  className="btn-primary"
                >
                  Agregar Primer Artículo
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-gray-300 mb-6">
              ¿Estás seguro de que quieres eliminar el inventario "{inventory.name}"? 
              Esta acción no se puede deshacer y se eliminarán todos los artículos asociados.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-secondary"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="btn-danger flex items-center gap-2"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
