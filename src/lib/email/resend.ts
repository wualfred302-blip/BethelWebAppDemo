import { BrevoClient } from '@getbrevo/brevo';

export const brevoApiKey = process.env.BREVO_API_KEY?.trim() || null;
export const brevoFromEmail = process.env.BREVO_FROM_EMAIL?.trim() || '';
export const brevoFromName = process.env.BREVO_FROM_NAME?.trim() || 'Bethel General';

let brevoClient: BrevoClient | null = null;
if (brevoApiKey) {
  brevoClient = new BrevoClient({ apiKey: brevoApiKey });
}

export async function sendBrevoEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ error?: string }> {
  if (!brevoClient || !brevoApiKey) {
    return { error: 'Brevo is not configured' };
  }

  try {
    await brevoClient.transactionalEmails.sendTransacEmail({
      sender: { email: brevoFromEmail, name: brevoFromName },
      to: [{ email: input.to }],
      subject: input.subject,
      htmlContent: input.html,
    });
    return {};
  } catch (err: unknown) {
    const errorBody = (err as { body?: { message?: string } })?.body;
    const message =
      errorBody?.message ??
      (err instanceof Error ? err.message : 'Unknown error sending email via Brevo');
    return { error: message };
  }
}
