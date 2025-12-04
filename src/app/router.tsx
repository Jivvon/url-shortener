import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Lazy load pages for code splitting
import { lazy, Suspense } from 'react';

const Landing = lazy(() => import('./pages/Landing'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Login = lazy(() => import('./pages/Login'));
const Callback = lazy(() => import('./pages/Callback'));
const DashboardLayout = lazy(() => import('./pages/dashboard/Layout'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Links = lazy(() => import('./pages/dashboard/Links'));
const NewLink = lazy(() => import('./pages/dashboard/NewLink'));
const LinkDetail = lazy(() => import('./pages/dashboard/LinkDetail'));
const Settings = lazy(() => import('./pages/dashboard/Settings'));

// Loading component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
}

// Public route wrapper (redirect if authenticated)
function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <PageLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  // Public routes
  {
    element: <PublicRoute />,
    children: [
      {
        path: '/',
        element: <Landing />,
      },
      {
        path: '/pricing',
        element: <Pricing />,
      },
      {
        path: '/login',
        element: <Login />,
      },
    ],
  },
  // Auth callback (no protection needed)
  {
    path: '/callback',
    element: (
      <Suspense fallback={<PageLoader />}>
        <Callback />
      </Suspense>
    ),
  },
  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/dashboard',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: 'links',
            element: <Links />,
          },
          {
            path: 'links/new',
            element: <NewLink />,
          },
          {
            path: 'links/:id',
            element: <LinkDetail />,
          },
          {
            path: 'settings',
            element: <Settings />,
          },
        ],
      },
    ],
  },
  // Catch all - redirect to home
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
