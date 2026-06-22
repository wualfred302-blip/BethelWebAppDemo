import { Resend } from 'resend';

export const resendApiKey = process.env.RESEND_API_KEY?.trim() || null;
export const resendFrom = process.env.RESEND_FROM_EMAIL?.trim() || 'Bethel General <onboarding@resend.dev>';

export const resend = resendApiKey ? new Resend(resendApiKey) : null;
