import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { inventoryService, type Inventory } from '~/lib/api';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function InventoryList() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [hostelFilter, setHostelFilter] = useState('');
  const [hostels, setHostels] = useState<{id: string, name: string}[]>([]);

  const loadInventories = async () => {
    try {
      setLoading(true);
      const params: any = { search: searchTerm };
      if (hostelFilter) params.hostel = hostelFilter;
      
      const response = await inventoryService.getInventories(params);
      setInventories(response.data.results);
    } catch (error) {
      console.error('Error loading inventories:', error);
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
  }, []);

  useEffect(() => {
    loadInventories();
  }, [searchTerm, hostelFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este inventario?')) return;
    
    try {
      await inventoryService.deleteInventory(id);
      loadInventories();
    } catch (error) {
      console.error('Error deleting inventory:', error);
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
          <h1 className="text-3xl font-bold text-white">Inventarios</h1>
          <p className="text-gray-300 mt-2">Gestionar inventarios por albergue</p>
        </div>
        <Link to="/dashboard/inventory/new" className="btn-primary flex items-center gap-2">
          <PlusIcon className="w-5 h-5" />
          Nuevo Inventario
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar inventarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
        <select
          value={hostelFilter}
          onChange={(e) => setHostelFilter(e.target.value)}
          className="input-field"
        >
          <option value="">Todos los albergues</option>
          {hostels.map((hostel) => (
            <option key={hostel.id} value={hostel.id}>
              {hostel.name}
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-white">Inventario</th>
                <th className="px-4 py-3 text-left text-white">Albergue</th>
                <th className="px-4 py-3 text-left text-white">Estado</th>
                <th className="px-4 py-3 text-left text-white">Última Actualización</th>
                <th className="px-4 py-3 text-left text-white">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {inventories.map((inventory) => (
                <tr key={inventory.id} className="hover:bg-gray-700">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-white font-medium">{inventory.name}</p>
                      <p className="text-gray-400 text-sm">{inventory.description}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-300">{inventory.hostel_name}</span>
                  </td>
                  <td className="px-4 py-3">
                    {inventory.is_active ? (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                        Inactivo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {new Date(inventory.last_updated).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        to={`/dashboard/inventory/${inventory.id}`}
                        className="text-blue-400 hover:text-blue-300"
                        title="Ver detalles"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </Link>
                      <Link
                        to={`/dashboard/inventory/edit/${inventory.id}`}
                        className="text-yellow-400 hover:text-yellow-300"
                        title="Editar"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(inventory.id)}
                        className="text-red-400 hover:text-red-300"
                        title="Eliminar"
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

      {inventories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No se encontraron inventarios</p>
        </div>
      )}
    </div>
  );
}