import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Callback } from './pages/Callback';
import { Dashboard } from './pages/dashboard/Dashboard';
import { Links } from './pages/dashboard/Links';
import { NewLink } from './pages/dashboard/NewLink';
import { LinkDetail } from './pages/dashboard/LinkDetail';
import { Settings } from './pages/dashboard/Settings';
import { useAuthStore } from './stores/authStore';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Landing />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'callback',
        element: <Callback />,
      },
      {
        path: 'pricing',
        element: <div>Pricing Page (Coming Soon)</div>,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/links',
        element: (
          <ProtectedRoute>
            <Links />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/links/:id',
        element: (
          <ProtectedRoute>
            <LinkDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/new',
        element: (
          <ProtectedRoute>
            <NewLink />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/settings',
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
