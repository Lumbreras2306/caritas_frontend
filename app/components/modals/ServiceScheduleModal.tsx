import { useState, useEffect } from 'react';
import { servicesService, type ServiceSchedule, type ServiceScheduleRequest } from '~/lib/api';
import Modal from '~/components/ui/Modal';
import Button from '~/components/ui/Button';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { ClockIcon } from '@heroicons/react/24/outline';

interface ServiceScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schedule?: ServiceSchedule | null;
  title?: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

export default function ServiceScheduleModal({
  isOpen,
  onClose,
  onSuccess,
  schedule = null,
  title = 'Crear Horario de Servicio'
}: ServiceScheduleModalProps) {
  const [formData, setFormData] = useState<ServiceScheduleRequest>({
    day_of_week: 1, // Siempre lunes
    start_time: '08:00',
    end_time: '17:00',
    is_available: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (schedule) {
      setFormData({
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        is_available: schedule.is_available,
      });
    } else {
      setFormData({
        day_of_week: 1, // Siempre lunes
        start_time: '08:00',
        end_time: '17:00',
        is_available: true,
      });
    }
    setError('');
    setSuccess(false);
  }, [schedule, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (schedule) {
        await servicesService.updateSchedule(schedule.id, formData);
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        await servicesService.createSchedule(formData);
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      setError(
        error.response?.data?.detail || 
        error.response?.data?.message || 
        'Error al guardar el horario'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ServiceScheduleRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateTimeRange = () => {
    if (formData.start_time >= formData.end_time) {
      setError('La hora de fin debe ser posterior a la hora de inicio');
      return false;
    }
    return true;
  };

  const handleTimeChange = (field: 'start_time' | 'end_time', value: string) => {
    handleInputChange(field, value);
    if (field === 'start_time' && formData.end_time && value >= formData.end_time) {
      setError('La hora de fin debe ser posterior a la hora de inicio');
    } else if (field === 'end_time' && formData.start_time && value <= formData.start_time) {
      setError('La hora de fin debe ser posterior a la hora de inicio');
    } else {
      setError('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {schedule ? 'Horario actualizado exitosamente' : 'Horario creado exitosamente'}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-blue-900/30 border border-blue-500 text-blue-200 px-4 py-3 rounded-lg">
            <p className="text-sm">
              <strong>Nota:</strong> Este horario se aplicará para todos los días de la semana. 
              Solo necesitas especificar las horas de inicio y fin.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hora de inicio (24h)
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => handleTimeChange('start_time', e.target.value)}
                className="input-field"
                required
                step="60"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hora de fin (24h)
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => handleTimeChange('end_time', e.target.value)}
                className="input-field"
                required
                step="60"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_available"
              checked={formData.is_available}
              onChange={(e) => handleInputChange('is_available', e.target.checked)}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label htmlFor="is_available" className="ml-2 block text-sm text-gray-300">
              Horario disponible
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600">
          <Button
            type="button"
            onClick={onClose}
            disabled={loading || success}
            className="btn-secondary"
          >
            {success ? 'Cerrando...' : 'Cancelar'}
          </Button>
          <Button
            type="submit"
            disabled={loading || !validateTimeRange() || success}
            className="btn-primary flex items-center gap-2"
          >
            {loading && <LoadingSpinner size="sm" />}
            {success ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <ClockIcon className="w-4 h-4" />
            )}
            {success ? '¡Exitoso!' : (schedule ? 'Actualizar Horario' : 'Crear Horario')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
