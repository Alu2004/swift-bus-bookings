import { Bus, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const Header = () => {
  const { user, signOut } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        >
          <div className="bg-primary rounded-lg p-2">
            <Bus className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">BusBook</h1>
            <p className="text-xs text-muted-foreground">Kathmandu → Palung</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <>
              {user.isAdmin && location.pathname !== '/admin' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/admin')}
                >
                  Admin Panel
                </Button>
              )}
              {location.pathname !== '/bookings' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/bookings')}
                >
                  My Bookings
                </Button>
              )}
              {location.pathname !== '/profile' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/profile')}
                  className="hidden sm:flex"
                >
                  <User className="w-4 h-4" />
                </Button>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground sm:hidden">
                <User className="w-4 h-4" />
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
