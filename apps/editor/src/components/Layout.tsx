import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    const apiToken = import.meta.env.VITE_API_TOKEN;
    // Se c'è API token, il logout non ha effetto (torna sempre autenticato)
    if (apiToken) {
      // Con API token, non fare logout (o mostra un messaggio)
      return;
    }
    
    logout();
    // Navigate viene gestito da ProtectedRoute
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/logo_capibara.png" 
                alt="Capibara" 
                className="h-8 w-8 object-contain"
              />
              <h1 className="text-xl font-bold text-gray-900">Capibara Editor</h1>
            </Link>

            <div className="flex items-center space-x-4">
              {!import.meta.env.VITE_API_TOKEN && (
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
