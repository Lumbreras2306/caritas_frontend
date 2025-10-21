import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { usersService, type PreRegisterUser } from '~/lib/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import Button from '~/components/ui/Button';
import { 
  ArrowLeftIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import PreRegisterDetailModal from '~/components/modals/PreRegisterDetailModal';
import ConfirmationModal from '~/components/modals/ConfirmationModal';

export default function PreRegisters() {
  const navigate = useNavigate();
  const [preRegisters, setPreRegisters] = useState<PreRegisterUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState('PENDING');
  const [actionLoading, setActionLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPreRegisterId, setSelectedPreRegisterId] = useState<string | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [actionPreRegisterId, setActionPreRegisterId] = useState<string | null>(null);

  const loadPreRegisters = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersService.getPreRegisters({ status: filter });
      setPreRegisters(response.data.results);
    } catch (error) {
      console.error('Error loading pre-registers:', error);
      setError('Error al cargar los pre-registros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreRegisters();
  }, [filter]);

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    
    try {
      setActionLoading(true);
      await usersService.approvePreRegisters(selectedIds);
      setSelectedIds([]);
      loadPreRegisters();
      alert(`${selectedIds.length} pre-registro(s) aprobado(s) correctamente`);
    } catch (error) {
      console.error('Error approving pre-registers:', error);
      alert('Error al aprobar los pre-registros');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    // Verificar que el preregistro esté rechazado
    const preRegister = preRegisters.find(p => p.id === id);
    if (!preRegister || preRegister.status !== 'REJECTED') {
      setError('Solo se pueden eliminar preregistros rechazados');
      return;
    }
    
    setActionPreRegisterId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!actionPreRegisterId) return;
    
    try {
      setActionLoading(true);
      await usersService.deletePreRegister(actionPreRegisterId);
      loadPreRegisters();
      setDeleteModalOpen(false);
      setActionPreRegisterId(null);
      setSuccessMessage('Pre-registro eliminado correctamente');
      setSuccessModalOpen(true);
    } catch (error) {
      console.error('Error deleting pre-register:', error);
      setError('Error al eliminar el pre-registro');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (id: string) => {
    setSelectedPreRegisterId(id);
    setDetailModalOpen(true);
  };

  const handleApprove = (id: string) => {
    setActionPreRegisterId(id);
    setApproveModalOpen(true);
  };

  const handleReject = (id: string) => {
    setActionPreRegisterId(id);
    setRejectModalOpen(true);
  };

  const confirmApprove = async () => {
    if (!actionPreRegisterId) return;
    
    // Encontrar el preregistro seleccionado
    const preRegister = preRegisters.find(p => p.id === actionPreRegisterId);
    if (!preRegister) return;
    
    // Cerrar modal
    setApproveModalOpen(false);
    setActionPreRegisterId(null);
    
    // Navegar al formulario de nuevo usuario con datos prellenados
    const params = new URLSearchParams({
      from_preregister: 'true',
      first_name: preRegister.first_name,
      last_name: preRegister.last_name,
      phone_number: preRegister.phone_number,
      age: preRegister.age.toString(),
      gender: preRegister.gender,
      preregister_id: preRegister.id
    });
    
    navigate(`/dashboard/users/new?${params.toString()}`);
  };

  const confirmReject = async () => {
    if (!actionPreRegisterId) return;
    
    try {
      setActionLoading(true);
      await usersService.rejectPreRegister(actionPreRegisterId);
      loadPreRegisters();
      setRejectModalOpen(false);
      setActionPreRegisterId(null);
    } catch (error) {
      console.error('Error rejecting pre-register:', error);
      setError('Error al rechazar el pre-registro');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
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
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              to="/dashboard/users"
              className="flex items-center text-gray-400 hover:text-white mr-4"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Volver
            </Link>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center">
                <ClipboardDocumentListIcon className="w-8 h-8 mr-3" />
                Pre-registros
              </h1>
              <p className="mt-2 text-gray-300">
                Gestiona los pre-registros de usuarios
              </p>
            </div>
            
            {selectedIds.length > 0 && (
              <Button 
                onClick={handleBulkApprove} 
                disabled={actionLoading}
                className="btn-primary flex items-center space-x-2"
              >
                {actionLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    <span>Aprobar {selectedIds.length} seleccionados</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          {['PENDING', 'APPROVED', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {status === 'PENDING' && 'Pendientes'}
              {status === 'APPROVED' && 'Aprobados'}
              {status === 'REJECTED' && 'Rechazados'}
            </button>
          ))}
        </div>

        {/* Pre-registers Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === preRegisters.length && preRegisters.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(preRegisters.map(p => p.id));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Edad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Género
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {preRegisters.map((preRegister) => (
                  <tr key={preRegister.id} className="hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(preRegister.id)}
                        onChange={() => toggleSelection(preRegister.id)}
                        className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {preRegister.first_name} {preRegister.last_name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {preRegister.gender === 'M' ? 'Masculino' : 'Femenino'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-300">
                        <PhoneIcon className="w-4 h-4 mr-2" />
                        {preRegister.phone_number}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {preRegister.age} años
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {preRegister.gender === 'M' ? 'Masculino' : 'Femenino'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-300">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {format(new Date(preRegister.created_at), 'dd/MM/yyyy', { locale: es })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {/* Ver detalles - siempre disponible */}
                        <button
                          onClick={() => handleViewDetails(preRegister.id)}
                          className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                          title="Ver detalles"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>

                        {/* Acciones específicas según el estado */}
                        {preRegister.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(preRegister.id)}
                              disabled={actionLoading}
                              className="text-green-400 hover:text-green-300 disabled:opacity-50 flex items-center space-x-1"
                              title="Aprobar"
                            >
                              <CheckIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(preRegister.id)}
                              disabled={actionLoading}
                              className="text-red-400 hover:text-red-300 disabled:opacity-50 flex items-center space-x-1"
                              title="Rechazar"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* Solo preregistros rechazados pueden ser eliminados */}
                        {preRegister.status === 'REJECTED' && (
                          <button
                            onClick={() => handleDelete(preRegister.id)}
                            disabled={actionLoading}
                            className="text-red-400 hover:text-red-300 disabled:opacity-50 flex items-center space-x-1"
                            title="Eliminar preregistro rechazado"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {preRegisters.length === 0 && !loading && (
            <div className="text-center py-12">
              <ClipboardDocumentListIcon className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No hay pre-registros
              </h3>
              <p className="text-gray-400">
                {filter === 'pending' && 'No hay pre-registros pendientes'}
                {filter === 'approved' && 'No hay pre-registros aprobados'}
                {filter === 'rejected' && 'No hay pre-registros rechazados'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      <PreRegisterDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedPreRegisterId(null);
        }}
        preRegisterId={selectedPreRegisterId || ''}
      />

      {/* Modal de confirmación para aprobar */}
      <ConfirmationModal
        isOpen={approveModalOpen}
        onClose={() => {
          setApproveModalOpen(false);
          setActionPreRegisterId(null);
        }}
        onConfirm={confirmApprove}
        title="Aprobar Pre-registro"
        message="¿Estás seguro de que quieres aprobar este pre-registro? Esta acción convertirá el pre-registro en un usuario activo del sistema."
        confirmText="Aprobar"
        type="info"
        loading={actionLoading}
      />

      {/* Modal de confirmación para rechazar */}
      <ConfirmationModal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setActionPreRegisterId(null);
        }}
        onConfirm={confirmReject}
        title="Rechazar Pre-registro"
        message="¿Estás seguro de que quieres rechazar este pre-registro? Esta acción marcará el pre-registro como rechazado y no se podrá revertir."
        confirmText="Rechazar"
        type="danger"
        loading={actionLoading}
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setActionPreRegisterId(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Pre-registro"
        message="¿Estás seguro de que quieres eliminar este pre-registro rechazado? Esta acción es permanente y no se puede deshacer."
        confirmText="Eliminar"
        type="danger"
        loading={actionLoading}
      />

      {/* Modal de éxito */}
      <ConfirmationModal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        onConfirm={() => setSuccessModalOpen(false)}
        title="Operación Exitosa"
        message={successMessage}
        confirmText="Aceptar"
        type="info"
        loading={false}
      />
    </div>
  );
}