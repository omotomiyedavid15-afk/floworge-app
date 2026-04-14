import nodemailer from "nodemailer";

// ── Transport ─────────────────────────────────────────────────────────────────

function createTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // If no SMTP credentials, fall back to Ethereal (console-prints preview URL)
  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  });
}

// ── Code generator ────────────────────────────────────────────────────────────

export function generateVerificationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ── Email template ────────────────────────────────────────────────────────────

export function verificationEmailHtml({
  code,
  name,
  expiresMinutes = 10,
}: {
  code: string;
  name?: string;
  expiresMinutes?: number;
}): string {
  const greeting = name ? `Hi ${name.split(" ")[0]},` : "Hi there,";
  const segments = code.split("");
  const half1 = segments.slice(0, 3).join(" ");
  const half2 = segments.slice(3, 6).join(" ");

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Verify your FlowForge email</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: #0d0d0d;
      font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      margin: 0;
      padding: 0;
    }

    .wrapper {
      width: 100%;
      background-color: #0d0d0d;
      padding: 40px 16px;
    }

    .container {
      max-width: 520px;
      margin: 0 auto;
    }

    /* ── Header ── */
    .header {
      text-align: center;
      padding-bottom: 32px;
    }

    .logo-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
    }

    .logo-text {
      color: #ededed;
      font-size: 17px;
      font-weight: 600;
      letter-spacing: -0.34px;
      line-height: 1;
    }

    /* ── Card ── */
    .card {
      background-color: #161616;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 20px;
      padding: 40px 40px 36px;
      overflow: hidden;
    }

    /* top accent line */
    .card-accent {
      height: 2px;
      margin: -40px -40px 36px;
      background: linear-gradient(90deg, #18e299 0%, #0fa76e 100%);
      border-radius: 20px 20px 0 0;
    }

    .card-title {
      color: #ededed;
      font-size: 26px;
      font-weight: 400;
      letter-spacing: -0.52px;
      line-height: 1.2;
      margin-bottom: 8px;
    }

    .card-subtitle {
      color: #888888;
      font-size: 14px;
      font-weight: 400;
      letter-spacing: -0.14px;
      line-height: 1.6;
      margin-bottom: 32px;
    }

    /* ── Code block ── */
    .code-wrapper {
      background-color: #0d0d0d;
      border: 1px solid rgba(24, 226, 153, 0.2);
      border-radius: 14px;
      padding: 28px 24px 24px;
      text-align: center;
      margin-bottom: 28px;
      position: relative;
    }

    .code-label {
      color: #18e299;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      font-family: 'Courier New', Courier, monospace;
      margin-bottom: 14px;
    }

    .code-digits {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .code-digit {
      display: inline-flex;
      width: 52px;
      height: 60px;
      align-items: center;
      justify-content: center;
      background-color: #1a1a1a;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: #ededed;
      font-family: 'Courier New', Courier, monospace;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 0;
      line-height: 1;
    }

    .code-separator {
      color: rgba(255, 255, 255, 0.2);
      font-size: 20px;
      font-weight: 300;
      margin: 0 4px;
      padding-bottom: 4px;
    }

    .code-expires {
      margin-top: 16px;
      color: #555555;
      font-size: 12px;
      font-weight: 400;
      letter-spacing: -0.05px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
    }

    .code-expires-dot {
      display: inline-block;
      width: 5px;
      height: 5px;
      background-color: #eab308;
      border-radius: 50%;
    }

    /* ── Body text ── */
    .body-text {
      color: #666666;
      font-size: 13px;
      font-weight: 400;
      letter-spacing: -0.1px;
      line-height: 1.65;
      margin-bottom: 20px;
    }

    .body-text a {
      color: #18e299;
      text-decoration: none;
    }

    /* ── Divider ── */
    .divider {
      height: 1px;
      background-color: rgba(255, 255, 255, 0.06);
      margin: 24px 0;
    }

    /* ── Security notice ── */
    .security-notice {
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      padding: 14px 16px;
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }

    .security-icon {
      flex-shrink: 0;
      margin-top: 1px;
    }

    .security-text {
      color: #555555;
      font-size: 12px;
      font-weight: 400;
      letter-spacing: -0.05px;
      line-height: 1.6;
    }

    /* ── Footer ── */
    .footer {
      text-align: center;
      padding-top: 28px;
    }

    .footer-text {
      color: #333333;
      font-size: 12px;
      font-weight: 400;
      letter-spacing: -0.05px;
      line-height: 1.6;
    }

    .footer-links {
      margin-top: 8px;
    }

    .footer-link {
      color: #444444;
      font-size: 11px;
      text-decoration: none;
    }

    .footer-dot {
      color: #2a2a2a;
      margin: 0 6px;
    }

    /* ── Responsive ── */
    @media only screen and (max-width: 480px) {
      .card { padding: 28px 20px 24px; }
      .card-accent { margin: -28px -20px 28px; }
      .code-digit { width: 42px; height: 52px; font-size: 22px; }
      .card-title { font-size: 22px; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">

      <!-- ── Logo header ── -->
      <div class="header">
        <a class="logo-link" href="${process.env.NEXTAUTH_URL ?? "https://flowforge.app"}" target="_blank" rel="noopener">
          <!--[if mso]><table><tr><td><![endif]-->
          <span style="display:inline-block;vertical-align:middle;">
            <svg width="20" height="20" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <circle cx="8" cy="11" r="7" fill="#ededed"/>
              <circle cx="14" cy="11" r="7" fill="#0d0d0d" stroke="#ededed" stroke-width="1.5"/>
            </svg>
          </span>
          <span class="logo-text">FlowForge</span>
          <!--[if mso]></td></tr></table><![endif]-->
        </a>
      </div>

      <!-- ── Card ── -->
      <div class="card">
        <div class="card-accent"></div>

        <h1 class="card-title">Verify your email</h1>
        <p class="card-subtitle">${greeting} Use the code below to verify your email address and activate your FlowForge account.</p>

        <!-- ── Code block ── -->
        <div class="code-wrapper">
          <p class="code-label">Verification code</p>
          <div class="code-digits">
            <span class="code-digit">${segments[0]}</span>
            <span class="code-digit">${segments[1]}</span>
            <span class="code-digit">${segments[2]}</span>
            <span class="code-separator">·</span>
            <span class="code-digit">${segments[3]}</span>
            <span class="code-digit">${segments[4]}</span>
            <span class="code-digit">${segments[5]}</span>
          </div>
          <p class="code-expires">
            <span class="code-expires-dot"></span>
            Expires in ${expiresMinutes} minutes
          </p>
        </div>

        <p class="body-text">
          Enter this code on the verification page to confirm your identity.
          For security, do not share this code with anyone — FlowForge will never ask for it.
        </p>

        <div class="divider"></div>

        <!-- ── Security notice ── -->
        <div class="security-notice">
          <span class="security-icon">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 1L2 3.5V7c0 2.761 2.239 5 5 5s5-2.239 5-5V3.5L7 1z" stroke="#555555" stroke-width="1.1" stroke-linejoin="round"/>
              <path d="M5 7l1.5 1.5L9 5" stroke="#555555" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <p class="security-text">
            If you didn't create a FlowForge account, you can safely ignore this email.
            This code will expire automatically after ${expiresMinutes} minutes.
          </p>
        </div>
      </div>

      <!-- ── Footer ── -->
      <div class="footer">
        <p class="footer-text">
          FlowForge &mdash; Design-to-engineering handoff
        </p>
        <div class="footer-links">
          <a class="footer-link" href="${process.env.NEXTAUTH_URL ?? "#"}/privacy">Privacy</a>
          <span class="footer-dot">&middot;</span>
          <a class="footer-link" href="${process.env.NEXTAUTH_URL ?? "#"}/terms">Terms</a>
          <span class="footer-dot">&middot;</span>
          <a class="footer-link" href="mailto:support@flowforge.app">Support</a>
        </div>
      </div>

    </div>
  </div>
</body>
</html>`;
}

export function verificationEmailText({
  code,
  name,
  expiresMinutes = 10,
}: {
  code: string;
  name?: string;
  expiresMinutes?: number;
}): string {
  const greeting = name ? `Hi ${name.split(" ")[0]},` : "Hi there,";
  return [
    "FlowForge — Email Verification",
    "",
    greeting,
    "",
    `Your verification code is: ${code}`,
    "",
    `This code expires in ${expiresMinutes} minutes.`,
    "",
    "If you didn't create a FlowForge account, you can safely ignore this email.",
    "",
    "— The FlowForge team",
  ].join("\n");
}

// ── Send function ─────────────────────────────────────────────────────────────

export async function sendVerificationEmail({
  to,
  name,
  code,
}: {
  to: string;
  name?: string;
  code: string;
}) {
  const from = process.env.SMTP_FROM ?? `FlowForge <noreply@flowforge.app>`;
  const subject = `${code} is your FlowForge verification code`;
  const html = verificationEmailHtml({ code, name });
  const text = verificationEmailText({ code, name });

  const transport = createTransport();

  if (!transport) {
    // Dev fallback: create a throwaway Ethereal account and log the preview URL
    const testAccount = await nodemailer.createTestAccount();
    const ethereal = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    const info = await ethereal.sendMail({ from, to, subject, html, text });
    console.log(
      `\n[email] No SMTP configured — preview at: ${nodemailer.getTestMessageUrl(info)}\n`
    );
    return;
  }

  await transport.sendMail({ from, to, subject, html, text });
}
