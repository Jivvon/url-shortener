import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api';

export function Login() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { url } = await api.getGoogleLoginUrl();
      window.location.href = url;
    } catch (err) {
      console.error('Failed to get login URL:', err);
      setError('Failed to initialize login. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-2">Snip</h1>
          <p className="text-indigo-100">URL Shortener for Modern Teams</p>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Shorten, Track, and Grow
            </h2>
            <p className="text-lg text-indigo-100 leading-relaxed">
              Join thousands of teams using Snip to create short, memorable links and track their performance with powerful analytics.
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-4">
            {[
              { icon: '⚡', text: 'Lightning-fast redirects globally' },
              { icon: '📊', text: 'Real-time analytics and insights' },
              { icon: '🔒', text: 'Enterprise-grade security' },
              { icon: '🎨', text: 'Custom branded links' },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-xl">
                  {feature.icon}
                </div>
                <span className="text-indigo-50">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-indigo-100 text-sm">
          © 2024 Snip. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Snip
            </h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back
              </h2>
              <p className="text-gray-600">
                Sign in to manage your links and view analytics
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2 text-red-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full group relative flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-indigo-300 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="font-semibold">
                    {isLoading ? 'Connecting...' : 'Continue with Google'}
                  </span>
                </>
              )}
            </button>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-sm text-gray-500">
                By continuing, you agree to our{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <span className="text-indigo-600 font-medium">Sign up is automatic with Google</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
