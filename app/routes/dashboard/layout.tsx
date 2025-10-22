import { Link, Outlet, useLocation, Navigate } from 'react-router';
import { useAuth } from '~/lib/auth';
import LoadingSpinner from '~/components/ui/LoadingSpinner';
import { 
  HomeIcon, 
  UserGroupIcon, 
  BuildingOfficeIcon, 
  WrenchScrewdriverIcon, 
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function DashboardLayout() {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirigir al login si no está autenticado
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Usuarios', href: '/dashboard/users', icon: UserGroupIcon },
    { name: 'Albergues', href: '/dashboard/hostels', icon: BuildingOfficeIcon },
    { name: 'Servicios', href: '/dashboard/services', icon: WrenchScrewdriverIcon },
    { name: 'Inventario', href: '/dashboard/inventory', icon: ArchiveBoxIcon },
  ];

  const adminNavigation = [
    { name: 'Administradores', href: '/dashboard/admins', icon: UserGroupIcon },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64" style={{ backgroundColor: '#2d3748', borderRight: '1px solid #4a5568' }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-20" style={{ backgroundColor: '#2B5A8C', borderBottom: '2px solid #4A90A4' }}>
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Cáritas de Monterrey" 
                className="h-16 w-auto"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-4">
            {/* Navegación principal */}
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-link flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'text-white' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                    style={{
                      backgroundColor: isActive ? '#4A90A4' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#4A90A4';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Separador */}
            <div className="border-t my-4" style={{ borderColor: '#4a5568' }}></div>

            {/* Navegación de administración */}
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider font-semibold px-3" style={{ color: '#a0aec0' }}>
                Administración
              </p>
              {adminNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-link flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'text-white' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                    style={{
                      backgroundColor: isActive ? '#4A90A4' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#4A90A4';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t" style={{ borderColor: '#4a5568' }}>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#4A90A4' }}>
                <span className="text-white text-sm font-semibold">
                  {user.full_name?.charAt(0) || user.username?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.full_name || user.username}
                </p>
                <p className="text-xs" style={{ color: '#a0aec0' }}>
                  {user.is_superuser ? 'Administrador' : 'Usuario'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white rounded-lg transition-all duration-200"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4A90A4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="py-8 px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}