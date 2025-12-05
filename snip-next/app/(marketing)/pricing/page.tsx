import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    originalPrice: null,
    description: 'Perfect for getting started',
    features: [
      '50 links / month',
      'Basic analytics',
      '7-day history',
      'Standard support',
    ],
    cta: 'Get Started',
    href: '/login',
    popular: false,
    badge: null,
    comingSoon: false,
  },
  {
    name: 'Pro',
    price: '$0',
    originalPrice: '$10',
    description: 'For power users and creators',
    features: [
      '1,000 links / month',
      'Custom aliases',
      'QR codes',
      '90-day history',
      'Advanced analytics',
      'Priority support',
    ],
    cta: 'Start Free Now',
    href: process.env.NEXT_PUBLIC_POLAR_CHECKOUT_PRO || '/login',
    popular: true,
    badge: '🎉 Limited Time Free',
    comingSoon: false,
  },
  {
    name: 'Max',
    price: '$30',
    originalPrice: null,
    description: 'For growing teams and businesses',
    features: [
      'Unlimited links',
      'Custom domains',
      'Team members',
      'API access',
      'Unlimited history',
      'Dedicated support',
    ],
    cta: 'Coming Soon',
    href: '#',
    popular: false,
    badge: '🚀 Coming Soon',
    comingSoon: true,
  },
]

export default function PricingPage() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Simple, transparent pricing
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Choose the perfect plan for your needs. Always know what you'll pay.
          </p>
        </div>

        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`flex flex-col justify-between p-8 ring-1 ring-gray-200 xl:p-10 ${plan.popular ? 'ring-2 ring-indigo-600 scale-105 shadow-xl relative' : ''
                } ${plan.comingSoon ? 'opacity-75' : ''}`}
            >
              {plan.badge && (
                <span className={`absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-sm font-semibold shadow-sm ${plan.comingSoon
                    ? 'bg-gray-600 text-white'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  }`}>
                  {plan.badge}
                </span>
              )}
              <div>
                <div className="flex items-center justify-between gap-x-4">
                  <h3 className="text-lg font-semibold leading-8 text-gray-900">{plan.name}</h3>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600">{plan.description}</p>
                <p className="mt-6 flex items-baseline gap-x-2">
                  {plan.originalPrice && (
                    <span className="text-2xl font-medium text-gray-400 line-through">{plan.originalPrice}</span>
                  )}
                  <span className={`text-4xl font-bold tracking-tight ${plan.price === '$0' && plan.originalPrice ? 'text-green-600' : 'text-gray-900'}`}>
                    {plan.price}
                  </span>
                  <span className="text-sm font-semibold leading-6 text-gray-600">/month</span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                className={`mt-8 w-full ${plan.popular
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
                    : ''
                  } ${plan.comingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
                variant={plan.popular ? 'default' : 'outline'}
                disabled={plan.comingSoon}
                asChild={!plan.comingSoon}
              >
                {plan.comingSoon ? (
                  <span>{plan.cta}</span>
                ) : (
                  <a href={plan.href}>{plan.cta}</a>
                )}
              </Button>
            </Card>
          ))}
        </div>

        {/* Note about Pro plan */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            🎉 <span className="font-semibold text-indigo-600">Limited Time Offer:</span> Pro plan is currently free during our beta period!
          </p>
        </div>
      </div>
    </div>
  )
}
