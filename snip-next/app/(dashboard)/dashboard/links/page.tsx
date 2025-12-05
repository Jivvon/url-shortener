import { createClient } from '@/lib/supabase/server'
import { LinkList } from '@/components/dashboard/link-list'
import { redirect } from 'next/navigation'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function LinksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Parse params
  const page = Number(params.page) || 1
  const limit = Number(params.limit) || 10
  const search = params.search as string
  const from = (page - 1) * limit
  const to = from + limit - 1

  // Build query
  let query = supabase
    .from('links')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (search) {
    query = query.or(`title.ilike.%${search}%,original_url.ilike.%${search}%,short_code.ilike.%${search}%`)
  }

  const { data: links, count } = await query

  // Add short_url to links
  const formattedLinks = links?.map(link => ({
    ...link,
    short_url: `${process.env.NEXT_PUBLIC_SHORT_DOMAIN}/${link.short_code}`
  })) || []

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Links</h1>
        <p className="text-gray-600 mt-1">Manage and track your short links</p>
      </div>

      <LinkList
        initialLinks={formattedLinks}
        pagination={{
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }}
      />
    </div>
  )
}
