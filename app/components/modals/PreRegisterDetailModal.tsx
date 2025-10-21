import { useState, useEffect } from 'react';
import { usersService, type PreRegisterUser } from '~/lib/api';
import Modal from '~/components/ui/Modal';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { 
  UserIcon, 
  PhoneIcon, 
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface PreRegisterDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  preRegisterId: string;
}

export default function PreRegisterDetailModal({ 
  isOpen, 
  onClose, 
  preRegisterId 
}: PreRegisterDetailModalProps) {
  const [preRegister, setPreRegister] = useState<PreRegisterUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && preRegisterId) {
      loadPreRegister();
    }
  }, [isOpen, preRegisterId]);

  const loadPreRegister = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await usersService.getPreRegister(preRegisterId);
      setPreRegister(response.data);
    } catch (err: any) {
      console.error('Error loading pre-register:', err);
      setError('Error al cargar los detalles del pre-registro');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      'PENDING': 'Pendiente',
      'APPROVED': 'Aprobado',
      'REJECTED': 'Rechazado'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="w-5 h-5 text-yellow-400" />;
      case 'APPROVED':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'REJECTED':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No disponible';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Pre-registro" size="lg">
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadPreRegister}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Reintentar
          </button>
        </div>
      ) : preRegister ? (
        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Nombre completo</label>
                <p className="text-white">{preRegister.first_name} {preRegister.last_name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-400">Edad</label>
                <p className="text-white">{preRegister.age} años</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-400">Género</label>
                <p className="text-white">{preRegister.gender === 'M' ? 'Masculino' : 'Femenino'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-400">Estado</label>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(preRegister.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(preRegister.status)}`}>
                    {getStatusText(preRegister.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <PhoneIcon className="w-5 h-5 mr-2" />
              Información de Contacto
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Número de teléfono</label>
                <p className="text-white">{preRegister.phone_number}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-400">Política de privacidad</label>
                <p className="text-white">
                  {preRegister.privacy_policy_accepted ? 'Aceptada' : 'No aceptada'}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Fechas
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Fecha de registro</label>
                <p className="text-white">{formatDate(preRegister.created_at)}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-400">Última actualización</label>
                <p className="text-white">{formatDate(preRegister.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
