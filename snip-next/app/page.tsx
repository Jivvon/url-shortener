'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function Home() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const code = searchParams.get('code')

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            {/* Logo */}
            <Link href="/" className="inline-block mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Snip
              </h1>
            </Link>

            {/* Main Heading */}
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6">
              <span className="block">Shorten URLs,</span>
              <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Expand Reach.
              </span>
            </h2>

            {/* Subtitle */}
            <p className="max-w-2xl mx-auto text-xl sm:text-2xl text-gray-600 mb-10">
              Create short, memorable links in seconds. Track clicks, analyze traffic, and grow your audience with powerful analytics.
            </p>

            {/* Error Message */}
            {error && (
              <Card className="max-w-md mx-auto mb-8 p-4 bg-red-50 border-red-200">
                <div className="flex items-start gap-3 text-red-800">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm">
                    {error === 'not_found' && (
                      <>
                        <p className="font-semibold">Link not found</p>
                        <p className="text-red-700">The short link "{code}" does not exist.</p>
                      </>
                    )}
                    {error === 'inactive' && (
                      <>
                        <p className="font-semibold">Link inactive</p>
                        <p className="text-red-700">This link has been deactivated by the owner.</p>
                      </>
                    )}
                    {error === 'expired' && (
                      <>
                        <p className="font-semibold">Link expired</p>
                        <p className="text-red-700">This link has expired and is no longer available.</p>
                      </>
                    )}
                    {error === 'limit_reached' && (
                      <>
                        <p className="font-semibold">Click limit reached</p>
                        <p className="text-red-700">This link has reached its maximum number of clicks.</p>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/login">
                <Button size="lg" className="group px-8 py-6 text-lg">
                  Start for Free
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">10K+</div>
                <div className="text-sm text-gray-600 mt-1">Links Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">1M+</div>
                <div className="text-sm text-gray-600 mt-1">Clicks Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-600 to-indigo-600 bg-clip-text text-transparent">99.9%</div>
                <div className="text-sm text-gray-600 mt-1">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Everything you need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features to help you manage and track your links effectively
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="p-8 bg-gradient-to-br from-indigo-50 to-white border-indigo-100 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Powered by edge computing. Your links redirect in milliseconds, anywhere in the world.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-8 bg-gradient-to-br from-purple-50 to-white border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Detailed Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Track every click with insights on location, device, browser, and referrer. Make data-driven decisions.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-8 bg-gradient-to-br from-pink-50 to-white border-pink-100 hover:border-pink-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Custom Domains</h3>
              <p className="text-gray-600 leading-relaxed">
                Use custom aliases and QR codes. Build trust with branded short links that reflect your identity.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-indigo-100 mb-10">
            Join thousands of users who trust Snip for their link management needs.
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="px-8 py-6 text-lg bg-white text-indigo-600 hover:bg-gray-100">
              Start Free Today
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link href="/" className="text-white font-bold text-xl">
                Snip
              </Link>
              <p className="text-sm mt-1">URL Shortener for Modern Teams</p>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            © 2024 Snip. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
