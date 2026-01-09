import { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);

  // Check if already authenticated or API token is set (only once)
  useEffect(() => {
    const apiToken = import.meta.env.VITE_API_TOKEN;
    if ((apiToken || isAuthenticated) && !hasRedirected.current && location.pathname === '/login') {
      hasRedirected.current = true;
      navigate('/', { replace: true });
      return;
    }
  }, [navigate, isAuthenticated, location.pathname]);

  // Reset redirect flag if we're not authenticated anymore
  useEffect(() => {
    if (!isAuthenticated && location.pathname === '/login') {
      hasRedirected.current = false;
    }
  }, [isAuthenticated, location.pathname]);

  // Don't render login form if already authenticated or API token is set
  const apiToken = import.meta.env.VITE_API_TOKEN;
  if (apiToken || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(identifier, password);
      navigate('/');
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Errore durante il login. Verifica le credenziali.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Capibara Editor
            </h1>
            <p className="text-gray-600">Accedi per gestire i contenuti</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="text-red-600 mt-0.5" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="identifier" className="label">
                Email o Username
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="input"
                required
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              Usa le credenziali Strapi per accedere
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
