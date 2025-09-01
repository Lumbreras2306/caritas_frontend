import { Link, useLocation } from 'react-router';
import { useAuth } from '~/lib/auth';
import { HomeIcon, BuildingOfficeIcon, WrenchScrewdriverIcon, ArchiveBoxIcon, UserGroupIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Albergues', href: '/dashboard/hostels', icon: BuildingOfficeIcon },
    { name: 'Servicios', href: '/dashboard/services', icon: WrenchScrewdriverIcon },
    { name: 'Inventario', href: '/dashboard/inventory', icon: ArchiveBoxIcon },
    { name: 'Usuarios', href: '/dashboard/users', icon: UserGroupIcon },
  ];

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary-600">🏠 Caritas</span>
            </Link>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.href);
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Hola, <span className="font-medium">{user?.full_name || user?.username}</span>
            </span>
            <button
              onClick={logout}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-1" />
              Salir
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}