import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/Login';
import DashboardPage from './pages/Dashboard';
import CreateColumnPage from './pages/CreateColumn';
import EditColumnPage from './pages/EditColumn';
import CreateArticlePage from './pages/CreateArticle';
import EditArticlePage from './pages/EditArticle';
import Layout from './components/Layout';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
