import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useLinkStore } from '../../stores/linkStore';
import { Card, CardContent, CardTitle, Button } from '../../components/ui';

export default function Dashboard() {
  const { user, plan } = useAuthStore();
  const { links, fetchLinks, isLoading } = useLinkStore();

  useEffect(() => {
    fetchLinks({ limit: 5 });
  }, [fetchLinks]);

  const recentLinks = links.slice(0, 5);
  const totalClicks = links.reduce((sum, link) => sum + link.total_clicks, 0);

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your links
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Links</p>
                <p className="text-3xl font-bold text-gray-900">{links.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Clicks</p>
                <p className="text-3xl font-bold text-gray-900">{totalClicks}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Monthly Limit</p>
                <p className="text-3xl font-bold text-gray-900">
                  {user?.url_count_this_month || 0}/{plan?.url_limit || 50}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      ((user?.url_count_this_month || 0) / (plan?.url_limit || 50)) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Links */}
      <Card padding="none">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <CardTitle>Recent Links</CardTitle>
          <Link to="/dashboard/links">
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </Link>
        </div>
        <div className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : recentLinks.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 mb-4">No links yet</p>
              <Link to="/dashboard/links/new">
                <Button>Create Your First Link</Button>
              </Link>
            </div>
          ) : (
            recentLinks.map((link) => (
              <Link
                key={link.id}
                to={`/dashboard/links/${link.id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-blue-600 truncate">
                      {link.short_url}
                    </p>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {link.title || link.original_url}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center text-sm text-gray-500">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                      />
                    </svg>
                    {link.total_clicks}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
