import { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useLinkStore } from '../../stores/linkStore';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { user } = useAuthStore();
  const { links, total, fetchLinks, isLoading } = useLinkStore();

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
          </div>
          <Link
            to="/dashboard/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <span>+</span> Create New Link
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Links</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{total}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Total Clicks</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {links.reduce((acc, link) => acc + link.total_clicks, 0)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">Plan Usage</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {user?.url_count_this_month} <span className="text-lg text-gray-400 font-normal">/ {user?.plan_id === 'free' ? 50 : '∞'}</span>
            </p>
          </div>
        </div>

        {/* Recent Links */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Links</h2>
            <Link to="/dashboard/links" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              View All
            </Link>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : links.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">You haven't created any links yet.</p>
              <Link
                to="/dashboard/new"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Create your first link
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {links.slice(0, 5).map((link) => (
                <li key={link.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-medium text-indigo-600 truncate">
                          {link.short_code}
                        </h3>
                        <span className="text-gray-300">|</span>
                        <p className="text-sm text-gray-900 truncate max-w-md">
                          {link.original_url}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                        <span>{new Date(link.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{link.total_clicks} clicks</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`https://s.lento.dev/${link.short_code}`);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copy"
                      >
                        Copy
                      </button>
                      <Link
                        to={`/dashboard/links/${link.id}`}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
