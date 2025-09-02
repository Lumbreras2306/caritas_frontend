import { useState } from 'react';
import { Link } from 'react-router';
import { usersService } from '~/lib/api';
import Button from '~/components/ui/Button';

export default function Register() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    age: '',
    gender: 'M' as 'M' | 'F',
    privacy_policy_accepted: false,
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await usersService.createPreRegister({
        ...formData,
        age: parseInt(formData.age),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear pre-registro');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="card text-center animate-fade-in">
            <div className="text-green-500 text-4xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Pre-registro Exitoso!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu solicitud ha sido enviada. Un administrador la revisará y te contactaremos pronto.
            </p>
            <Link to="/" className="btn-primary">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8 animate-fade-in">
          <span className="text-4xl font-bold text-primary-600">🏠 Caritas</span>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Pre-registro
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Solicita acceso a nuestros servicios
          </p>
        </div>

        <div className="card animate-slide-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                required
                className="input-field"
                placeholder="+52 1234567890"
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Edad
                </label>
                <input
                  type="number"
                  required
                  min="18"
                  max="100"
                  className="input-field"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Género
                </label>
                <select
                  required
                  className="input-field"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value as 'M' | 'F'})}
                >
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="privacy"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.privacy_policy_accepted}
                onChange={(e) => setFormData({...formData, privacy_policy_accepted: e.target.checked})}
              />
              <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                Acepto la política de privacidad
              </label>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Enviar Pre-registro
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-primary-600 hover:text-primary-700 text-sm">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}