import { useAuthStore } from '../../stores/authStore';

export function Settings() {
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
              <p className="text-sm text-gray-500 mt-1">Your account details</p>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-6">
                <img
                  src={user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name}`}
                  alt={user?.name}
                  className="w-20 h-20 rounded-full border border-gray-200"
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
                  <p className="text-gray-500">{user?.email}</p>
                  <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                    {user?.plan_id} Plan
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Usage */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Plan Usage</h2>
              <p className="text-sm text-gray-500 mt-1">Current month's usage statistics</p>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Links Created</span>
                  <span className="text-sm text-gray-500">
                    {user?.url_count_this_month} / {user?.plan_id === 'free' ? 50 : 'Unlimited'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{
                      width: `${Math.min(
                        ((user?.url_count_this_month || 0) / (user?.plan_id === 'free' ? 50 : 100)) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Usage resets on {new Date(user?.month_reset_at || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-red-100 bg-red-50">
              <h2 className="text-lg font-bold text-red-900">Danger Zone</h2>
              <p className="text-sm text-red-700 mt-1">Irreversible account actions</p>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Sign Out</h3>
                  <p className="text-sm text-gray-500">Sign out of your account on this device</p>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
