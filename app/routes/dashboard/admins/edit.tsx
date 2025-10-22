import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { adminUsersService, type AdminUser, type AdminUserUpdateData } from '~/lib/api';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import Button from '~/components/ui/Button';
import { 
  ArrowLeftIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export default function EditAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    is_active: true,
    is_staff: true,
    is_superuser: true,
  });

  const loadAdmin = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await adminUsersService.getAdminUser(id);
      const adminData = response.data;
      setAdmin(adminData);
      
      // Llenar el formulario con los datos existentes
      setFormData({
        username: adminData.username,
        first_name: adminData.first_name,
        last_name: adminData.last_name,
        password: '', // No cargar la contraseña existente
        is_active: adminData.is_active,
        is_staff: adminData.is_staff,
        is_superuser: adminData.is_superuser,
      });
    } catch (error: any) {
      console.error('Error loading admin:', error);
      setError('Error al cargar la información del administrador.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmin();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setSaving(true);
    setError('');

    try {
      // Validar campos requeridos
      if (!formData.username.trim()) {
        setError('El nombre de usuario es requerido');
        return;
      }
      if (!formData.first_name.trim()) {
        setError('El nombre es requerido');
        return;
      }
      if (!formData.last_name.trim()) {
        setError('El apellido es requerido');
        return;
      }

      // Si se proporciona una nueva contraseña, validar su longitud
      if (formData.password && formData.password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres');
        return;
      }

      // Preparar los datos para la actualización
      const updateData: AdminUserUpdateData = {
        username: formData.username.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        is_active: formData.is_active,
        is_staff: formData.is_staff,
        is_superuser: formData.is_superuser,
      };

      // Solo incluir la contraseña si se proporciona una nueva
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }
      
      await adminUsersService.updateAdminUser(id, updateData);
      navigate('/dashboard/admins/list');
    } catch (err: any) {
      console.error('Error updating admin:', err);
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error al actualizar administrador';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="text-center py-12">
        <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">Administrador no encontrado</p>
        <Link to="/dashboard/admins" className="btn-primary mt-4">
          Volver a Administradores
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/admins')}
          className="p-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <PencilIcon className="w-8 h-8 text-orange-400" />
            Editar Administrador
          </h1>
          <p className="text-gray-300 mt-1">Modificar información de {admin.full_name}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-blue-400" />
            Información del Administrador
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre de Usuario *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="usuario_admin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="Dejar vacío para mantener la actual"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Dejar vacío para mantener la contraseña actual
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Juan"
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
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Pérez"
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium text-white">Estado</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="rounded"
                />
                <span className="text-gray-300">Administrador activo</span>
              </label>
            </div>

            <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mt-4">
              <h4 className="text-blue-300 font-medium mb-2">Información:</h4>
              <ul className="text-sm text-blue-200 space-y-1">
                <li>• <strong>Administrador activo:</strong> Puede iniciar sesión en el sistema</li>
                <li>• Todos los administradores tienen acceso completo al panel</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <Button
            type="submit"
            loading={saving}
            className="btn-primary flex items-center gap-2"
          >
            <PencilIcon className="w-5 h-5" />
            Actualizar Administrador
          </Button>
          
          <button
            type="button"
            onClick={() => navigate('/dashboard/admins')}
            className="btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
