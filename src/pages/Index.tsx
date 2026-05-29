
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, LogOut, Wine } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Add a small delay to ensure auth state is properly loaded
    const timer = setTimeout(() => {
      if (user) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header com informa��es do usu�rio - sempre vis�vel quando user existe */}
      {user && (
        <div className="w-full flex justify-between items-center p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center space-x-3">
            <Wine className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <div>
              <h1 className="text-blue-600 font-bold text-base sm:text-lg">neg�cio</h1>
              <p className="text-blue-500 text-xs sm:text-sm">do Jeser</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg px-2 py-1 sm:px-3 sm:py-2 border border-green-200">
              <div className="text-right">
                <p className="text-xs sm:text-sm font-medium text-gray-900">{user.username}</p>
                <p className="text-xs text-gray-600 capitalize">{user.type}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:bg-red-50 h-6 w-6 sm:h-8 sm:w-8 p-0 flex-shrink-0"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Conte�do principal centralizado */}
      <div 
        className="flex items-center justify-center w-full"
        style={{ 
          height: user ? 'calc(100vh - 80px)' : '100vh',
          minHeight: user ? 'calc(100vh - 80px)' : '100vh'
        }}
      >
        <div className="text-center p-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 text-sm sm:text-base">Carregando...</p>
        </div>
      </div>
    </div>
  );
};

export default Index;


