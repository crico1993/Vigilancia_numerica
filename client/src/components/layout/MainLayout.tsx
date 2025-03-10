import { useState } from 'react';
import { Sidebar, MobileSidebar } from '@/components/ui/sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
}

export default function MainLayout({ children, title = "Dashboard", action }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <Sidebar />
        </div>
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top header for mobile */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <i className="ri-menu-line text-xl"></i>
          </button>
          <div className="flex-1 px-4 flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
              <i className="ri-health-book-line text-lg"></i>
            </div>
            <span className="ml-2 font-medium text-gray-800 text-lg">Vigilância em Números</span>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex justify-between items-center mb-6">
                {title && (
                  <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
                )}
                {action && (
                  <div className="flex-shrink-0">
                    {action}
                  </div>
                )}
              </div>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
