import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { inventoryService, type Inventory, type InventoryItemDetail } from '~/lib/api';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { 
  PencilIcon, 
  PlusIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  CubeIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export default function InventoryDetail() {
  const { id } = useParams();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [items, setItems] = useState<InventoryItemDetail[]>([]);
  const [loading, setLoading] = useState(true);
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
      
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

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

        {items.length > 0 ? (
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
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-medium">{item.item.name}</p>
                        <p className="text-gray-400 text-sm">{item.item.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                        {item.item.category}
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
                        {item.quantity} {item.item.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">
                      {item.minimum_stock} {item.item.unit}
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
    </div>
  );
}
