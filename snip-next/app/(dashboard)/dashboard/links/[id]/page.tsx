import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StatsChart } from '@/components/dashboard/stats-chart'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'

export default async function LinkDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch link details
  const { data: link } = await supabase
    .from('links')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!link) {
    redirect('/dashboard/links')
  }

  // Fetch stats (last 30 days)
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)

  const { data: dailyStats } = await supabase.rpc('get_daily_clicks', {
    p_link_id: link.id,
    p_start_date: startDate.toISOString(),
  })

  // Fetch device stats
  const { data: deviceStats } = await supabase
    .from('clicks')
    .select('device')
    .eq('link_id', link.id)
    .gte('created_at', startDate.toISOString())

  const devices = deviceStats?.reduce((acc: any, curr) => {
    const device = curr.device || 'unknown'
    acc[device] = (acc[device] || 0) + 1
    return acc
  }, {})

  const shortUrl = `${process.env.NEXT_PUBLIC_SHORT_DOMAIN}/${link.short_code}`

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard/links" className="text-gray-500 hover:text-gray-700">
              Links
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">Details</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{link.title || 'Untitled Link'}</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <a href={shortUrl} target="_blank" rel="noreferrer">
              Visit Link
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </Button>
          <Button variant="destructive">Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Stats Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Link Info Card */}
          <Card className="p-6">
            <div className="grid gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Short Link</label>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xl font-mono text-indigo-600 font-medium">
                    {shortUrl}
                  </span>
                  <Button variant="ghost" size="sm">Copy</Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Original URL</label>
                <p className="mt-1 text-gray-900 break-all">{link.original_url}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="mt-1 text-gray-900">
                    {new Date(link.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Clicks</label>
                  <p className="mt-1 text-gray-900 font-bold">{link.total_clicks}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Chart */}
          <StatsChart data={dailyStats || []} />
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* QR Code */}
          <Card className="p-6 flex flex-col items-center text-center">
            <h3 className="text-lg font-semibold mb-4">QR Code</h3>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
              <QRCodeSVG value={shortUrl} size={150} />
            </div>
            <Button variant="outline" className="w-full">Download PNG</Button>
          </Card>

          {/* Device Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Devices</h3>
            <div className="space-y-4">
              {Object.entries(devices || {}).map(([device, count]: [string, any]) => (
                <div key={device} className="flex items-center justify-between">
                  <span className="capitalize text-gray-600">{device}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{count}</span>
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${(count / link.total_clicks) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {Object.keys(devices || {}).length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No data yet</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
