import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { Webhook } from 'standardwebhooks'

const POLAR_WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET!

export async function POST(request: Request) {
  if (!POLAR_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Polar webhook secret not configured' }, { status: 500 })
  }

  const headersList = await headers()
  const signature = headersList.get('webhook-signature')
  const timestamp = headersList.get('webhook-timestamp')
  const body = await request.text()

  if (!signature || !timestamp) {
    return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 })
  }

  // Verify signature
  const wh = new Webhook(POLAR_WEBHOOK_SECRET)
  try {
    wh.verify(body, {
      'webhook-signature': signature,
      'webhook-timestamp': timestamp,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 })
  }

  const event = JSON.parse(body)
  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'subscription.created':
      case 'subscription.updated': {
        const subscription = event.data
        const customerId = subscription.customer_id
        const planId = mapPolarProductToPlan(subscription.product_id)

        // Find user by email (Polar customer email should match Supabase user email)
        // Note: In a real app, you might want to store the customer ID when they first checkout
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', subscription.customer.email)
          .single()

        if (profile) {
          await supabase
            .from('profiles')
            .update({
              plan_id: planId,
              polar_customer_id: customerId,
              polar_subscription_id: subscription.id,
              subscription_status: subscription.status,
              current_period_end: subscription.current_period_end,
            })
            .eq('id', profile.id)
        }
        break
      }

      case 'subscription.canceled':
      case 'subscription.revoked': {
        const subscription = event.data

        await supabase
          .from('profiles')
          .update({
            plan_id: 'free', // Revert to free plan
            subscription_status: 'canceled',
          })
          .eq('polar_subscription_id', subscription.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Helper to map Polar Product IDs to our Plan IDs
// You would typically store these mappings in your DB or env vars
function mapPolarProductToPlan(productId: string): string {
  // Replace these with your actual Polar Product IDs
  const PRODUCT_MAP: Record<string, string> = {
    [process.env.POLAR_PRODUCT_PRO_ID!]: 'pro',
    [process.env.POLAR_PRODUCT_BUSINESS_ID!]: 'business',
  }

  return PRODUCT_MAP[productId] || 'free'
}
