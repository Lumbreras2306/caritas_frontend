import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { inventoryService, type InventoryItemDetail } from '~/lib/api';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { ExclamationTriangleIcon, PencilIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function LowStockItems() {
  const [items, setItems] = useState<InventoryItemDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState('');
  const [inventories, setInventories] = useState<{id: string, name: string}[]>([]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const params: any = { search: searchTerm };
      if (inventoryFilter) params.inventory = inventoryFilter;
      
      const response = await inventoryService.getLowStockItems(params);
      setItems(response.data.results);
    } catch (error) {
      console.error('Error loading low stock items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInventories = async () => {
    try {
      const response = await inventoryService.getInventories();
      setInventories(response.data.results.map(inv => ({
        id: inv.id,
        name: inv.name
      })));
    } catch (error) {
      console.error('Error loading inventories:', error);
    }
  };

  useEffect(() => {
    loadInventories();
  }, []);

  useEffect(() => {
    loadItems();
  }, [searchTerm, inventoryFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <ExclamationTriangleIcon className="w-8 h-8 text-yellow-500" />
          Artículos con Stock Bajo
        </h1>
        <p className="text-gray-300 mt-2">
          Artículos que requieren atención inmediata por stock bajo
        </p>
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
          value={inventoryFilter}
          onChange={(e) => setInventoryFilter(e.target.value)}
          className="input-field"
        >
          <option value="">Todos los inventarios</option>
          {inventories.map((inventory) => (
            <option key={inventory.id} value={inventory.id}>
              {inventory.name}
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
                <th className="px-4 py-3 text-left text-white">Inventario</th>
                <th className="px-4 py-3 text-left text-white">Cantidad Actual</th>
                <th className="px-4 py-3 text-left text-white">Stock Mínimo</th>
                <th className="px-4 py-3 text-left text-white">Diferencia</th>
                <th className="px-4 py-3 text-left text-white">Prioridad</th>
                <th className="px-4 py-3 text-left text-white">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {items.map((item) => {
                const difference = item.quantity - item.minimum_stock;
                const isOutOfStock = item.quantity === 0;
                const isLowStock = item.quantity <= item.minimum_stock && item.quantity > 0;
                
                return (
                  <tr key={item.id} className="hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-medium">{item.item.name}</p>
                        <p className="text-gray-400 text-sm">{item.item.description}</p>
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full mt-1 inline-block">
                          {item.item.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-300">{item.inventory_name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-lg ${
                        isOutOfStock 
                          ? 'text-red-400' 
                          : isLowStock 
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
                      <span className={`font-bold ${
                        difference < 0 ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {difference > 0 ? '+' : ''}{difference} {item.item.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isOutOfStock ? (
                        <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full font-bold">
                          CRÍTICO
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">
                          BAJO
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                          NORMAL
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          to={`/dashboard/inventory/${item.inventory}`}
                          className="text-blue-400 hover:text-blue-300"
                          title="Ver inventario"
                        >
                          <EyeIcon className="w-5 h-5" />
                        </Link>
                        <Link
                          to={`/dashboard/inventory/items/${item.id}/edit`}
                          className="text-yellow-400 hover:text-yellow-300"
                          title="Actualizar stock"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <ExclamationTriangleIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">¡Excelente! No hay artículos con stock bajo</p>
          <p className="text-gray-500 mt-2">Todos los artículos tienen stock suficiente</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="card bg-red-900/20 border border-red-600/30">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
              <div className="ml-4">
                <p className="text-red-200 font-bold text-lg">
                  {items.filter(item => item.quantity === 0).length}
                </p>
                <p className="text-red-300 text-sm">Sin Stock</p>
              </div>
            </div>
          </div>

          <div className="card bg-yellow-900/20 border border-yellow-600/30">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400" />
              <div className="ml-4">
                <p className="text-yellow-200 font-bold text-lg">
                  {items.filter(item => item.quantity > 0 && item.quantity <= item.minimum_stock).length}
                </p>
                <p className="text-yellow-300 text-sm">Stock Bajo</p>
              </div>
            </div>
          </div>

          <div className="card bg-blue-900/20 border border-blue-600/30">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-blue-200 font-bold text-lg">{items.length}</p>
                <p className="text-blue-300 text-sm">Total Alertas</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
