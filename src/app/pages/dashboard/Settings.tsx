import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardContent, CardTitle, Button } from '../../components/ui';

export default function Settings() {
  const { user, plan, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <Card>
          <CardContent>
            <CardTitle className="mb-4">Profile</CardTitle>
            <div className="flex items-start gap-4">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl text-gray-500 font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
                <p className="text-gray-500">{user?.email}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Member since {new Date(user?.created_at || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan */}
        <Card>
          <CardContent>
            <CardTitle className="mb-4">Current Plan</CardTitle>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{plan?.name}</h3>
                <p className="text-gray-500">
                  {plan?.url_limit === -1 ? 'Unlimited' : plan?.url_limit} URLs per month
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {user?.url_count_this_month || 0} used this month
                </p>
              </div>
              {plan?.id === 'free' && (
                <Button onClick={() => navigate('/pricing')}>Upgrade</Button>
              )}
            </div>

            {/* Features */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Features</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  {plan?.features.customAlias ? (
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={plan?.features.customAlias ? 'text-gray-700' : 'text-gray-400'}>
                    Custom Aliases
                  </span>
                </li>
                <li className="flex items-center text-sm">
                  {plan?.features.expiration ? (
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={plan?.features.expiration ? 'text-gray-700' : 'text-gray-400'}>
                    Link Expiration
                  </span>
                </li>
                <li className="flex items-center text-sm">
                  {plan?.features.qrCustom ? (
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={plan?.features.qrCustom ? 'text-gray-700' : 'text-gray-400'}>
                    QR Code Customization
                  </span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardContent>
            <CardTitle className="text-red-600 mb-4">Danger Zone</CardTitle>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Sign Out</h3>
                <p className="text-sm text-gray-500">
                  Sign out of your account on this device
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
