import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { servicesService, type Service } from '~/lib/api';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function ServicesList() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await servicesService.getServices({ search: searchTerm });
      setServices(response.data.results);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este servicio?')) return;
    
    try {
      await servicesService.deleteService(id);
      loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
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
        <h1 className="text-3xl font-bold text-white">Servicios</h1>
        <Link to="/dashboard/services/new" className="btn-primary">
          Nuevo Servicio
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar servicios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <div key={service.id} className="card hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-semibold text-white">{service.name}</h3>
              {service.is_active ? (
                <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                  Activo
                </span>
              ) : (
                <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                  Inactivo
                </span>
              )}
            </div>

            <p className="text-gray-300 text-sm mb-4 line-clamp-2">
              {service.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Precio:</span>
                <span className="text-white font-semibold">${service.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tipo:</span>
                <span className="text-white">
                  {service.reservation_type === 'individual' ? 'Individual' : 'Grupal'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tiempo máximo:</span>
                <span className="text-white">{service.max_time} min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Requiere aprobación:</span>
                <span className={service.needs_approval ? 'text-yellow-400' : 'text-green-400'}>
                  {service.needs_approval ? 'Sí' : 'No'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                to={`/dashboard/services/edit/${service.id}`}
                className="flex-1 text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <PencilIcon className="w-5 h-5 inline mr-2" />
                Editar
              </Link>
              <button
                onClick={() => handleDelete(service.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No se encontraron servicios</p>
        </div>
      )}
    </div>
  );
}