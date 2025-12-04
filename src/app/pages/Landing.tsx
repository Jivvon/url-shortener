import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header, Footer } from '../components/layout';
import { Button, Input } from '../components/ui';
import { useAuthStore } from '../stores/authStore';
import { useLinkStore } from '../stores/linkStore';

export default function Landing() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuthStore();
  const { createLink, isLoading } = useLinkStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!isAuthenticated) {
      // Redirect to login with URL to shorten
      navigate(`/login?redirect=/dashboard/links/new&url=${encodeURIComponent(url)}`);
      return;
    }

    const link = await createLink({ url });
    if (link) {
      navigate(`/dashboard/links/${link.id}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Shorten URLs, <span className="text-blue-600">Amplify Reach</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Create short, memorable links in seconds. Track clicks, analyze traffic,
              and share with confidence.
            </p>

            {/* URL Input Form */}
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type="url"
                    placeholder="Paste your long URL here..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    error={error}
                    className="h-12 text-lg"
                  />
                </div>
                <Button type="submit" size="lg" isLoading={isLoading}>
                  Shorten URL
                </Button>
              </div>
            </form>

            {!isAuthenticated && (
              <p className="mt-4 text-sm text-gray-500">
                <Link to="/login" className="text-blue-600 hover:underline">
                  Sign in
                </Link>{' '}
                to save and track your links
              </p>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Choose Snip?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Lightning Fast
                </h3>
                <p className="text-gray-600">
                  Create short links instantly with our optimized edge network.
                  No delays, ever.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Detailed Analytics
                </h3>
                <p className="text-gray-600">
                  Track clicks, locations, devices, and more. Know your audience
                  better.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
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
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  QR Codes
                </h3>
                <p className="text-gray-600">
                  Generate QR codes for your links. Perfect for print materials
                  and offline sharing.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              Join thousands of users who trust Snip for their link management needs.
            </p>
            <Link to="/login">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Create Your Free Account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
