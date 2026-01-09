import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import CreateColumnPage from './pages/CreateColumn';
import EditColumnPage from './pages/EditColumn';
import ManageColumnLinksPage from './pages/ManageColumnLinks';
import SelectColumnForLinksPage from './pages/SelectColumnForLinks';
import CreateArticlePage from './pages/CreateArticle';
import EditArticlePage from './pages/EditArticle';
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/columns/new"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateColumnPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/columns/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <EditColumnPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/columns/select-links"
        element={
          <ProtectedRoute>
            <Layout>
              <SelectColumnForLinksPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/columns/:id/links"
        element={
          <ProtectedRoute>
            <Layout>
              <ManageColumnLinksPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/articles/new"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateArticlePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/articles/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <EditArticlePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
