import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { useAuthStore } from './app/stores/authStore';

function App() {
  const { fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    // Try to restore user session on app load
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  return <RouterProvider router={router} />;
}

export default App;
