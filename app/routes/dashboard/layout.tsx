import { Link, Outlet, useLocation } from 'react-router';
import { useAuth } from '~/lib/auth';
import { 
  HomeIcon, 
  UserGroupIcon, 
  BuildingOfficeIcon, 
  WrenchScrewdriverIcon, 
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Usuarios', href: '/dashboard/users', icon: UserGroupIcon },
    { name: 'Albergues', href: '/dashboard/hostels', icon: BuildingOfficeIcon },
    { name: 'Servicios', href: '/dashboard/services', icon: WrenchScrewdriverIcon },
    { name: 'Inventario', href: '/dashboard/inventory', icon: ArchiveBoxIcon },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 border-r border-gray-700">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 bg-red-600 border-b border-red-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-red-600 text-lg font-bold">C</span>
              </div>
              <span className="text-white font-bold text-lg">Cáritas</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive ? 'active' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-xs text-gray-400">
                  {user?.is_superuser ? 'Administrador' : 'Usuario'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}