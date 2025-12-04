import { createClient } from '@/lib/supabase/server'
import { updateLinkSchema } from '@/lib/validations'
import { NextResponse } from 'next/server'

/**
 * GET /api/links/[id]
 * Get a specific link by ID
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: link, error } = await supabase
      .from('links')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error || !link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    // Add short URL
    const shortUrl = `${process.env.NEXT_PUBLIC_SHORT_DOMAIN}/${link.short_code}`

    return NextResponse.json({
      link: {
        ...link,
        short_url: shortUrl,
      },
    })
  } catch (error) {
    console.error('Error in GET /api/links/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/links/[id]
 * Update a link
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if link exists and belongs to user
    const { data: existingLink } = await supabase
      .from('links')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!existingLink) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json()
    const input = updateLinkSchema.parse(body)

    // Update link
    const { data: link, error } = await supabase
      .from('links')
      .update(input)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating link:', error)
      return NextResponse.json({ error: 'Failed to update link' }, { status: 500 })
    }

    // Add short URL
    const shortUrl = `${process.env.NEXT_PUBLIC_SHORT_DOMAIN}/${link.short_code}`

    return NextResponse.json({
      link: {
        ...link,
        short_url: shortUrl,
      },
    })
  } catch (error) {
    console.error('Error in PATCH /api/links/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/links/[id]
 * Delete a link
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete link (RLS will ensure it belongs to the user)
    const { error } = await supabase.from('links').delete().eq('id', params.id).eq('user_id', user.id)

    if (error) {
      console.error('Error deleting link:', error)
      return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/links/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
