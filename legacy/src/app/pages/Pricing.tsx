import { Link } from 'react-router-dom';
import { Header, Footer } from '../components/layout';
import { Button, Card } from '../components/ui';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: PlanFeature[];
  urlLimit: number;
  recommended?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    urlLimit: 50,
    features: [
      { name: '50 URLs per month', included: true },
      { name: 'Basic analytics (7 days)', included: true },
      { name: 'QR code generation', included: true },
      { name: 'Custom aliases', included: false },
      { name: 'Link expiration', included: false },
      { name: 'Priority support', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 5,
    description: 'For power users and creators',
    urlLimit: 1000,
    recommended: true,
    features: [
      { name: '1,000 URLs per month', included: true },
      { name: 'Advanced analytics (30 days)', included: true },
      { name: 'QR code customization', included: true },
      { name: 'Custom aliases', included: true },
      { name: 'Link expiration', included: true },
      { name: 'Priority support', included: false },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: 15,
    description: 'For teams and businesses',
    urlLimit: -1, // Unlimited
    features: [
      { name: 'Unlimited URLs', included: true },
      { name: 'Full analytics (90 days)', included: true },
      { name: 'QR code customization', included: true },
      { name: 'Custom aliases', included: true },
      { name: 'Link expiration', included: true },
      { name: 'Priority support', included: true },
    ],
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that works best for you. All plans include our core
              features.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.recommended
                    ? 'border-2 border-blue-500 shadow-lg'
                    : ''
                }`}
                padding="none"
              >
                {plan.recommended && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="text-gray-500 mt-1">{plan.description}</p>

                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-gray-500">/month</span>
                  </div>

                  <Link to="/login" className="block mt-6">
                    <Button
                      variant={plan.recommended ? 'primary' : 'outline'}
                      className="w-full"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>

                <div className="border-t border-gray-200 p-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        {feature.included ? (
                          <svg
                            className="w-5 h-5 text-green-500 mr-3 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                        <span
                          className={
                            feature.included ? 'text-gray-700' : 'text-gray-400'
                          }
                        >
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
              Frequently Asked Questions
            </h2>

            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Can I change my plan later?
                </h3>
                <p className="mt-2 text-gray-600">
                  Yes! You can upgrade or downgrade your plan at any time. Changes
                  take effect immediately.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  What happens if I exceed my URL limit?
                </h3>
                <p className="mt-2 text-gray-600">
                  You'll be notified when approaching your limit. You can upgrade
                  your plan or wait until the next billing cycle.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Do you offer refunds?
                </h3>
                <p className="mt-2 text-gray-600">
                  We offer a 14-day money-back guarantee for all paid plans. No
                  questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
