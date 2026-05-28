
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  LogOut, 
  Wine,
  Users
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarFooter
} from '@/components/ui/sidebar';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Produtos', href: '/products', icon: Package },
    { name: 'Clientes', href: '/clients', icon: Users },
    { name: 'Vendas', href: '/sales', icon: ShoppingCart },
    { name: 'Relatórios', href: '/reports', icon: BarChart3, adminOnly: true },
  ];

  const filteredNavigation = navigation.filter(item => 
    !item.adminOnly || user?.type === 'admin'
  );

  const AppSidebar = () => (
    <Sidebar>
      <SidebarHeader className="p-6 bg-gradient-to-r from-orange-600 to-amber-600">
        <div className="flex items-center space-x-3">
          <Wine className="h-8 w-8 text-white" />
          <div>
            <h1 className="text-white font-bold text-lg">DistribuiPro</h1>
            <p className="text-orange-100 text-sm">Gestão para distribuidoras</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {filteredNavigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild className={`w-full ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 hover:text-orange-600'
                    }`}>
                      <Link to={item.href} className="flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200">
                        <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                        {item.name}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-3 py-2">
          <div className="flex-1 text-right">
            <p className="text-sm font-medium text-gray-900">{user?.username}</p>
            <p className="text-xs text-gray-600 capitalize">{user?.type}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-red-600 hover:bg-red-50 h-8 w-8 p-0 flex-shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            {/* Header da página */}
            <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
              <SidebarTrigger className="hidden lg:inline-flex" />
              <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <div className="flex flex-1 items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                  </h2>
                </div>
              </div>
            </header>

            {/* Conteúdo da página */}
            <main className="py-4 pb-24 lg:pb-8 lg:py-8">
              <div className="w-full px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 lg:hidden">
        <ul className="grid grid-cols-5">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={`bottom-${item.name}`}>
                <Link
                  to={item.href}
                  className={`flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors ${
                    isActive ? 'text-orange-600' : 'text-slate-600'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-orange-600' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Layout;
