import { createClient } from '@/lib/supabase/server'
import { generateShortCode, isValidCustomAlias, isReservedCode } from '@/lib/shortcode'
import { validateUrl, generateTitleFromUrl } from '@/lib/url-validator'
import { createLinkSchema, linkQuerySchema } from '@/lib/validations'
import { NextResponse } from 'next/server'

/**
 * GET /api/links
 * Get user's links with pagination and search
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const params = linkQuerySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    })

    // Build query
    let query = supabase
      .from('links')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    // Search
    if (params.search) {
      query = query.or(`title.ilike.%${params.search}%,original_url.ilike.%${params.search}%,short_code.ilike.%${params.search}%`)
    }

    // Sort
    query = query.order(params.sortBy, { ascending: params.sortOrder === 'asc' })

    // Pagination
    const from = (params.page - 1) * params.limit
    const to = from + params.limit - 1
    query = query.range(from, to)

    const { data: links, error, count } = await query

    if (error) {
      console.error('Error fetching links:', error)
      return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 })
    }

    return NextResponse.json({
      links,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / params.limit),
      },
    })
  } catch (error) {
    console.error('Error in GET /api/links:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/links
 * Create a new short link
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile and plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('*, plans(*)')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const input = createLinkSchema.parse(body)

    // Validate URL
    const urlValidation = validateUrl(input.url)
    if (!urlValidation.valid) {
      return NextResponse.json({ error: urlValidation.error }, { status: 400 })
    }

    // Check plan limits
    const plan = profile.plans
    if (plan.url_limit && profile.url_count_this_month >= plan.url_limit) {
      return NextResponse.json(
        {
          error: 'Link limit reached',
          message: `Your ${plan.name} plan allows ${plan.url_limit} links per month. Upgrade to create more.`,
        },
        { status: 403 }
      )
    }

    // Generate or validate short code
    let shortCode: string

    if (input.customCode) {
      // Check if custom alias feature is available
      if (!plan.custom_alias) {
        return NextResponse.json(
          { error: 'Custom aliases are only available on Pro and Business plans' },
          { status: 403 }
        )
      }

      // Validate format
      if (!isValidCustomAlias(input.customCode)) {
        return NextResponse.json(
          { error: 'Invalid custom code format. Use 3-20 alphanumeric characters and hyphens.' },
          { status: 400 }
        )
      }

      // Check if reserved
      if (isReservedCode(input.customCode)) {
        return NextResponse.json({ error: 'This code is reserved and cannot be used' }, { status: 400 })
      }

      // Check if already taken
      const { data: existing } = await supabase
        .from('links')
        .select('id')
        .eq('short_code', input.customCode)
        .single()

      if (existing) {
        return NextResponse.json({ error: 'This code is already taken' }, { status: 409 })
      }

      shortCode = input.customCode
    } else {
      // Generate unique code
      let attempts = 0
      const maxAttempts = 10

      while (attempts < maxAttempts) {
        shortCode = generateShortCode()

        const { data: existing } = await supabase
          .from('links')
          .select('id')
          .eq('short_code', shortCode)
          .single()

        if (!existing) break
        attempts++
      }

      if (attempts === maxAttempts) {
        return NextResponse.json({ error: 'Failed to generate unique code. Please try again.' }, { status: 500 })
      }
    }

    // Generate title if not provided
    const title = input.title || generateTitleFromUrl(urlValidation.normalizedUrl!)

    // Create link
    const { data: link, error: createError } = await supabase
      .from('links')
      .insert({
        user_id: user.id,
        short_code: shortCode!,
        original_url: urlValidation.normalizedUrl!,
        title,
        expires_at: input.expiresAt,
        click_limit: input.clickLimit,
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating link:', createError)
      return NextResponse.json({ error: 'Failed to create link' }, { status: 500 })
    }

    // Update user's URL count
    await supabase
      .from('profiles')
      .update({ url_count_this_month: profile.url_count_this_month + 1 })
      .eq('id', user.id)

    // Return created link with short URL
    const shortUrl = `${process.env.NEXT_PUBLIC_SHORT_DOMAIN}/${shortCode}`

    return NextResponse.json(
      {
        link: {
          ...link,
          short_url: shortUrl,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/links:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
