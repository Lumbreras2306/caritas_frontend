import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { usersService } from '~/lib/api';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { 
  ArrowLeftIcon,
  UserIcon,
  PhoneIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export default function NewUser() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromPreRegister, setIsFromPreRegister] = useState(false);
  const [preRegisterId, setPreRegisterId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    age: 0,
    gender: 'M' as 'M' | 'F',
    poverty_level: 'LEVEL_1' as 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3',
  });

  // Autocompletar datos del preregistro
  useEffect(() => {
    const fromPreRegister = searchParams.get('from_preregister');
    if (fromPreRegister === 'true') {
      setIsFromPreRegister(true);
      setPreRegisterId(searchParams.get('preregister_id'));
      
      // Autocompletar formulario con datos del preregistro
      setFormData({
        first_name: searchParams.get('first_name') || '',
        last_name: searchParams.get('last_name') || '',
        phone_number: searchParams.get('phone_number') || '',
        age: parseInt(searchParams.get('age') || '0'),
        gender: (searchParams.get('gender') as 'M' | 'F') || 'M',
        poverty_level: 'LEVEL_1' as 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3',
      });
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar datos
      if (!formData.first_name.trim() || !formData.last_name.trim()) {
        throw new Error('El nombre y apellido son obligatorios');
      }
      
      if (!formData.phone_number.trim()) {
        throw new Error('El teléfono es obligatorio');
      }
      
      if (formData.age < 1 || formData.age > 120) {
        throw new Error('La edad debe estar entre 1 y 120 años');
      }

      if (!['LEVEL_1', 'LEVEL_2', 'LEVEL_3'].includes(formData.poverty_level)) {
        throw new Error('El nivel de pobreza debe ser válido');
      }

      // Crear usuario
      await usersService.createCustomer({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone_number: formData.phone_number.trim(),
        age: formData.age,
        gender: formData.gender,
        poverty_level: formData.poverty_level,
        is_active: true,
      });

      // Si viene de un preregistro, aprobarlo
      if (isFromPreRegister && preRegisterId) {
        try {
          await usersService.approvePreRegisters([preRegisterId]);
        } catch (err) {
          console.error('Error approving pre-register:', err);
          // No mostramos error aquí para no interrumpir el flujo
        }
      }

      // Redirigir a la lista de usuarios
      navigate('/dashboard/users/list');
    } catch (err: any) {
      console.error('Error creating user:', err);
      
      // Manejar errores de validación del backend
      if (err.response?.status === 400 && err.response?.data) {
        const errorData = err.response.data;
        let errorMessage = 'Error de validación:\n';
        
        // Procesar errores de campos específicos
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field])) {
            errorMessage += `• ${field}: ${errorData[field].join(', ')}\n`;
          } else {
            errorMessage += `• ${field}: ${errorData[field]}\n`;
          }
        });
        
        setError(errorMessage);
      } else {
        setError(err.message || 'Error al crear el usuario');
      }
    } finally {
      setLoading(false);
    }
  };

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
          
          <h1 className="text-3xl font-bold text-white">
            {isFromPreRegister ? 'Aprobar Pre-registro' : 'Nuevo Usuario'}
          </h1>
          <p className="mt-2 text-gray-300">
            {isFromPreRegister 
              ? 'Completa los datos faltantes para aprobar este pre-registro'
              : 'Crea un nuevo usuario en el sistema'
            }
          </p>
          {isFromPreRegister && (
            <div className="mt-3 p-3 bg-blue-900 border border-blue-700 rounded-lg">
              <p className="text-blue-300 text-sm">
                ℹ️ Los datos básicos han sido prellenados desde el pre-registro. 
                Por favor, completa el nivel de pobreza y revisa la información.
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-700 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-300 mb-2">
                  Error de validación
                </h3>
                <div className="text-sm text-red-300 whitespace-pre-line">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2" />
                  Información Personal
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Nombre del usuario"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="Apellido del usuario"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <PhoneIcon className="w-5 h-5 mr-2" />
                  Información de Contacto
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                      placeholder="+52 81 1234 5678"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Edad *
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      required
                      min="1"
                      max="120"
                      className="input-field"
                      placeholder="25"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <UserGroupIcon className="w-5 h-5 mr-2" />
                  Información Adicional
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Género *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      className="input-field"
                    >
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nivel de Pobreza *
                    </label>
                <select
                  name="poverty_level"
                  value={formData.poverty_level}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                >
                  <option value="LEVEL_1">Nivel 1</option>
                  <option value="LEVEL_2">Nivel 2</option>
                  <option value="LEVEL_3">Nivel 3</option>
                </select>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-700">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>{isFromPreRegister ? 'Aprobando...' : 'Creando...'}</span>
                    </>
                  ) : (
                    <>
                      <UserIcon className="w-5 h-5" />
                      <span>{isFromPreRegister ? 'Aprobar Pre-registro' : 'Crear Usuario'}</span>
                    </>
                  )}
                </button>
                
                <Link
                  to="/dashboard/users"
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all duration-200 text-center"
                >
                  Cancelar
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}