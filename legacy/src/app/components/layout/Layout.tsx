import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export function Layout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <span className="font-bold text-xl tracking-tight">Snip</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {!isDashboard && (
              <>
                <Link to="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">
                  Pricing
                </Link>
                <a href="https://github.com/lento/snip" target="_blank" rel="noreferrer" className="text-gray-600 hover:text-gray-900 font-medium">
                  GitHub
                </a>
              </>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 focus:outline-none">
                    <img
                      src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-gray-200"
                    />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 hidden group-hover:block">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link to="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Settings
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                  Log in
                </Link>
                <Link
                  to="/login"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      {!isDashboard && (
        <footer className="bg-white border-t border-gray-200 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center text-white font-bold text-sm">
                  S
                </div>
                <span className="font-bold text-lg">Snip</span>
              </div>
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} Snip. Built with Cloudflare Workers.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
