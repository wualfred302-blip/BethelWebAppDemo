import { maskEmail } from '@/lib/auth/tokens';

export function buildOtpEmailHtml(input: {
  code: string;
  email: string;
  expiresMinutes: number;
}) {
  const maskedEmail = maskEmail(input.email);

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f8f9fa;font-family:Arial,Helvetica,sans-serif;color:#191c1d;">
    <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
      <div style="background:#ffffff;border:1px solid #e1e3e4;border-radius:18px;padding:32px;box-shadow:0 18px 40px rgba(56,72,136,0.08);">
        <div style="font-size:11px;line-height:1.2;letter-spacing:.16em;text-transform:uppercase;color:#b89858;font-weight:700;margin-bottom:10px;">
          Bethel General
        </div>
        <h1 style="font-size:28px;line-height:1.15;margin:0 0 10px;color:#384888;">
          Your verification code
        </h1>
        <p style="font-size:15px;line-height:1.6;margin:0 0 20px;color:#434750;">
          Use this 6-digit code to continue signing in.
        </p>
        <div style="margin:0 0 20px;padding:16px 18px;border-radius:16px;border:1px solid #d8ddec;background:#f3f5fb;color:#2e508e;font-size:30px;letter-spacing:.35em;font-weight:700;text-align:center;">
          ${input.code}
        </div>
        <p style="font-size:14px;line-height:1.6;margin:0 0 12px;color:#434750;">
          This code was requested for ${maskedEmail} and expires in ${input.expiresMinutes} minutes.
        </p>
        <p style="font-size:12px;line-height:1.6;margin:0;color:#64748b;">
          If you did not request this code, you can ignore this message.
        </p>
      </div>
    </div>
  </body>
</html>`;
}
