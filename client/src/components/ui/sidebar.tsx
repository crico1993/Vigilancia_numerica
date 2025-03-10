import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

type SidebarLink = {
  href: string;
  label: string;
  icon: string;
  role: string[];
};

const links: SidebarLink[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: 'ri-dashboard-line',
    role: ['admin', 'server', 'manager']
  },
  {
    href: '/activities',
    label: 'Atividades',
    icon: 'ri-file-list-3-line',
    role: ['admin', 'server', 'manager']
  },
  {
    href: '/reports',
    label: 'Relatórios',
    icon: 'ri-bar-chart-grouped-line',
    role: ['admin', 'server', 'manager']
  },
  {
    href: '/users',
    label: 'Usuários',
    icon: 'ri-user-line',
    role: ['admin']
  },
  {
    href: '/settings',
    label: 'Configurações',
    icon: 'ri-settings-line',
    role: ['admin', 'server', 'manager']
  }
];

export function Sidebar({ className }: { className?: string }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  if (!user) return null;
  
  // Filter links based on user role
  const filteredLinks = links.filter(link => link.role.includes(user.role));
  
  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className={cn("flex flex-col h-0 flex-1 bg-white border-r border-gray-200", className)}>
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-600">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-primary-600">
            <i className="ri-health-book-line text-lg"></i>
          </div>
          <span className="ml-2 text-white font-medium text-lg">Vigilância em Números</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 bg-white">
          <div className="space-y-1">
            {/* Current user info */}
            <div className="px-3 py-2 rounded-md mb-4 bg-gray-50">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-700 font-medium text-sm">{getInitials(user.name)}</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-500">{
                    user.role === 'admin' ? 'Administrador' : 
                    user.role === 'manager' ? 'Gestor' : 'Servidor'
                  }</p>
                </div>
              </div>
            </div>
            
            {/* Navigation links */}
            {filteredLinks.map((link) => (
              <div key={link.href}>
                <Link href={link.href}>
                  <div className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer", 
                    location === link.href
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}>
                    <i className={cn(
                      link.icon, 
                      "mr-3", 
                      location === link.href
                        ? "text-primary-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    )}></i>
                    {link.label}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </nav>
      </div>
      
      {/* Logout button */}
      <div className="border-t border-gray-200 p-4">
        <button 
          type="button" 
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
        >
          <i className="ri-logout-box-line mr-2"></i>
          Sair do sistema
        </button>
      </div>
    </div>
  );
}

export function MobileSidebar({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  if (!isOpen) return null;
  
  return (
    <div className="md:hidden fixed inset-0 flex z-40">
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose}></div>
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button 
            type="button" 
            onClick={onClose}
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          >
            <span className="sr-only">Close sidebar</span>
            <i className="ri-close-line text-white text-xl"></i>
          </button>
        </div>
        <Sidebar />
      </div>
      <div className="flex-shrink-0 w-14"></div>
    </div>
  );
}
