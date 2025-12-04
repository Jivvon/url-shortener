import { resend, EMAIL_FROM } from '@/lib/resend/client'
import { WelcomeEmail } from '@/emails/welcome'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Welcome to Snip!',
      react: WelcomeEmail({
        name: name || 'User',
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`
      }),
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
