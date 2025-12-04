import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export const EMAIL_FROM = 'Snip <onboarding@resend.dev>' // Change this to your verified domain in production
