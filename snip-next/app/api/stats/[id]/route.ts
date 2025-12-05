import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

/**
 * GET /api/stats/[id]
 * Get statistics for a specific link
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get link and verify ownership
    const { data: link } = await supabase
      .from('links')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    // Parse period from query params
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d'

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case 'all':
        startDate = new Date(0)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Get total clicks and unique visitors
    const { data: summary } = await supabase
      .from('clicks')
      .select('ip_hash', { count: 'exact' })
      .eq('link_id', link.id)
      .gte('created_at', startDate.toISOString())

    const totalClicks = summary?.length || 0
    const uniqueVisitors = summary ? new Set(summary.map((c) => c.ip_hash)).size : 0

    // Get daily breakdown
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: dailyData } = await (supabase.rpc as any)('get_daily_clicks', {
      p_link_id: link.id,
      p_start_date: startDate.toISOString(),
    })

    // Get device breakdown
    const { data: deviceData } = await supabase
      .from('clicks')
      .select('device')
      .eq('link_id', link.id)
      .gte('created_at', startDate.toISOString())

    const devices = deviceData?.reduce((acc: Record<string, number>, click) => {
      const device = click.device || 'unknown'
      acc[device] = (acc[device] || 0) + 1
      return acc
    }, {})

    // Get browser breakdown
    const { data: browserData } = await supabase
      .from('clicks')
      .select('browser')
      .eq('link_id', link.id)
      .gte('created_at', startDate.toISOString())

    const browsers = browserData?.reduce((acc: Record<string, number>, click) => {
      const browser = click.browser || 'unknown'
      acc[browser] = (acc[browser] || 0) + 1
      return acc
    }, {})

    // Get country breakdown
    const { data: countryData } = await supabase
      .from('clicks')
      .select('country')
      .eq('link_id', link.id)
      .gte('created_at', startDate.toISOString())

    const countries = countryData?.reduce((acc: Record<string, number>, click) => {
      const country = click.country || 'unknown'
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {})

    // Get referer breakdown
    const { data: refererData } = await supabase
      .from('clicks')
      .select('referer')
      .eq('link_id', link.id)
      .gte('created_at', startDate.toISOString())

    const referers = refererData?.reduce((acc: Record<string, number>, click) => {
      const referer = click.referer || 'direct'
      acc[referer] = (acc[referer] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      summary: {
        total_clicks: totalClicks,
        unique_visitors: uniqueVisitors,
        avg_daily_clicks: dailyData?.length ? Math.round(totalClicks / dailyData.length) : 0,
      },
      daily: dailyData || [],
      devices: devices || {},
      browsers: browsers || {},
      countries: countries || {},
      referers: referers || {},
    })
  } catch (error) {
    console.error('Error in GET /api/stats/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
