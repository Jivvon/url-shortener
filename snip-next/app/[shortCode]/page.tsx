import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

/**
 * User-Agent parsing
 */
function parseUserAgent(userAgent: string | null): {
  device: 'desktop' | 'mobile' | 'tablet' | null
  browser: string | null
  os: string | null
} {
  if (!userAgent) {
    return { device: null, browser: null, os: null }
  }

  const ua = userAgent.toLowerCase()

  // Detect device
  let device: 'desktop' | 'mobile' | 'tablet' | null = 'desktop'
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device = 'tablet'
  } else if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/i.test(ua)) {
    device = 'mobile'
  }

  // Detect browser
  let browser: string | null = null
  if (ua.includes('edg/')) browser = 'edge'
  else if (ua.includes('chrome')) browser = 'chrome'
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'safari'
  else if (ua.includes('firefox')) browser = 'firefox'
  else if (ua.includes('opera') || ua.includes('opr/')) browser = 'opera'

  // Detect OS
  let os: string | null = null
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) os = 'ios'
  else if (ua.includes('windows')) os = 'windows'
  else if (ua.includes('mac os') || ua.includes('macos')) os = 'macos'
  else if (ua.includes('android')) os = 'android'
  else if (ua.includes('linux')) os = 'linux'

  return { device, browser, os }
}

/**
 * Hash IP address for privacy
 */
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(ip)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = new Uint8Array(hashBuffer)
  return Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16)
}

/**
 * Extract referer domain
 */
function extractRefererDomain(referer: string | null): string | null {
  if (!referer) return null
  try {
    const url = new URL(referer)
    return url.hostname
  } catch {
    return null
  }
}

export default async function RedirectPage({ params }: { params: { shortCode: string } }) {
  const supabase = await createClient()
  const { shortCode } = params

  // Skip favicon and robots.txt
  if (shortCode === 'favicon.ico' || shortCode === 'robots.txt') {
    return null
  }

  // Get link from database
  const { data: link } = await supabase
    .from('links')
    .select('*')
    .eq('short_code', shortCode)
    .single()

  // Link not found
  if (!link) {
    redirect(`/?error=not_found&code=${shortCode}`)
  }

  // Check if link is active
  if (!link.is_active) {
    redirect(`/?error=inactive&code=${shortCode}`)
  }

  // Check expiration
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    redirect(`/?error=expired&code=${shortCode}`)
  }

  // Check click limit
  if (link.click_limit && link.total_clicks >= link.click_limit) {
    redirect(`/?error=limit_reached&code=${shortCode}`)
  }

  // Log click asynchronously (fire and forget)
  const headersList = await headers()
  const userAgent = headersList.get('user-agent')
  const referer = headersList.get('referer')
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip')

  // Parse user agent
  const { device, browser, os } = parseUserAgent(userAgent)

  // Hash IP
  const ipHash = ip ? await hashIP(ip) : null

  // Extract referer domain
  const refererDomain = extractRefererDomain(referer)

  // Log click (don't await to avoid blocking redirect)
  supabase
    .from('clicks')
    .insert({
      link_id: link.id,
      device,
      browser,
      os,
      referer: refererDomain,
      ip_hash: ipHash,
    })
    .then(() => {
      // Also increment total clicks
      return supabase
        .from('links')
        .update({ total_clicks: link.total_clicks + 1 })
        .eq('id', link.id)
    })
    .catch((error) => {
      console.error('Error logging click:', error)
    })

  // Redirect to original URL
  redirect(link.original_url)
}
