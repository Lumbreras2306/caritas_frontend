import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { inventoryService, type Inventory, type InventoryItemDetail } from '~/lib/api';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { 
  BuildingOfficeIcon, 
  CubeIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export default function Inventory() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryItemDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInventories: 0,
    totalItems: 0,
    lowStockCount: 0,
    outOfStockCount: 0
  });

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar inventarios
      const inventoriesResponse = await inventoryService.getInventories();
      setInventories(inventoriesResponse.data.results);
      
      // Cargar artículos con stock bajo
      const lowStockResponse = await inventoryService.getLowStockItems();
      setLowStockItems(lowStockResponse.data.results);
      
      // Calcular estadísticas
      setStats({
        totalInventories: inventoriesResponse.data.count,
        totalItems: lowStockResponse.data.count,
        lowStockCount: lowStockResponse.data.results.length,
        outOfStockCount: lowStockResponse.data.results.filter(item => item.quantity === 0).length
      });
      
    } catch (error) {
      console.error('Error loading inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Inventario
          </h1>
          <p className="mt-2 text-gray-300">
            Supervisar stock y artículos del sistema
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-blue-600 rounded-lg">
                <BuildingOfficeIcon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Inventarios</p>
                <p className="text-2xl font-bold text-white">{stats.totalInventories}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-3 bg-green-600 rounded-lg">
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
        </div>

        {/* Acciones rápidas */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Acciones Rápidas</h3>
            <div className="space-y-3">
              <Link 
                to="/dashboard/inventory/new" 
                className="flex items-center gap-3 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Nuevo Inventario</span>
              </Link>
              <Link 
                to="/dashboard/inventory/items" 
                className="flex items-center gap-3 p-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                <CubeIcon className="w-5 h-5" />
                <span>Gestionar Artículos</span>
              </Link>
              <Link 
                to="/dashboard/inventory/low-stock" 
                className="flex items-center gap-3 p-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
              >
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span>Stock Bajo</span>
              </Link>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Inventarios Recientes</h3>
            <div className="space-y-3">
              {inventories.slice(0, 3).map((inventory) => (
                <Link
                  key={inventory.id}
                  to={`/dashboard/inventory/${inventory.id}`}
                  className="block p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-white">{inventory.name}</h4>
                      <p className="text-sm text-gray-300">{inventory.hostel_name}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      inventory.is_active 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-600 text-white'
                    }`}>
                      {inventory.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </Link>
              ))}
              {inventories.length === 0 && (
                <p className="text-gray-400 text-center py-4">No hay inventarios disponibles</p>
              )}
            </div>
          </div>
        </div>

        {/* Alertas de stock bajo */}
        {lowStockItems.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
              Alertas de Stock Bajo
            </h3>
            <div className="space-y-2">
              {lowStockItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                  <div>
                    <p className="font-medium text-white">{item.item.name}</p>
                    <p className="text-sm text-gray-300">{item.inventory_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-bold">{item.quantity}</p>
                    <p className="text-xs text-gray-400">Mín: {item.minimum_stock}</p>
                  </div>
                </div>
              ))}
              {lowStockItems.length > 5 && (
                <Link 
                  to="/dashboard/inventory/low-stock"
                  className="block text-center text-blue-400 hover:text-blue-300 py-2"
                >
                  Ver todas las alertas ({lowStockItems.length})
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
