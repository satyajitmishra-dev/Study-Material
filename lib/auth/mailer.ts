import nodemailer from 'nodemailer';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
}

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || '"StudyMaterial" <noreply@studymaterial.dev>';

  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text,
      });
      console.log(`[Mailer] Email dispatched to ${to}: ${subject}`);
      return { success: true };
    } catch (error: any) {
      console.error('[Mailer] SMTP delivery failed:', error);
      if (process.env.NODE_ENV === 'production') {
        return { success: false, error: 'SMTP_DELIVERY_FAILED', details: error.message };
      }
    }
  }

  // If transporter is null in production, it's a critical configuration failure
  if (process.env.NODE_ENV === 'production') {
    return { success: false, error: 'SMTP_NOT_CONFIGURED' };
  }

  // Developer Sandbox Fallback / Log
  console.log(`
============================================================
[SIMULATED EMAIL SYSTEM]
From: ${from}
To: ${to}
Subject: ${subject}
Text Content: ${text}
------------------------------------------------------------
HTML Content Preview:
${html}
============================================================
`);

  return { success: true, simulated: true };
}

// --- HTML EMAIL TEMPLATES ---

const getLayout = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      background-color: #121214;
      color: #E4E4E7;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #121214;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #161619;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #1f1235 0%, #111a2e 100%);
      padding: 30px;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: #FFFFFF;
    }
    .body {
      padding: 40px 30px;
      line-height: 1.6;
      font-size: 14px;
      color: #A1A1AA;
    }
    .body h2 {
      color: #FFFFFF;
      font-size: 18px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .btn-container {
      text-align: center;
      margin: 30px 0;
    }
    .btn {
      display: inline-block;
      padding: 12px 30px;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      color: #121214 !important;
      background-color: #FFFFFF;
      border-radius: 8px;
      transition: all 150ms ease;
    }
    .btn:hover {
      background-color: #E4E4E7;
    }
    .footer {
      padding: 20px 30px;
      text-align: center;
      font-size: 11px;
      color: #52525B;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      background-color: #141416;
    }
    .footer a {
      color: #00f2fe;
      text-decoration: none;
    }
    .highlight {
      color: #00f2fe;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>📚 StudyMaterial</h1>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p>This is an automated system email from StudyMaterial. If you did not trigger this request, please ignore it.</p>
        <p>© 2026 StudyMaterial. Built for Creators.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export function getWelcomeEmailHtml(name: string) {
  const content = `
    <h2>Welcome to StudyMaterial, ${name}!</h2>
    <p>We are thrilled to have you join our developer workspace. StudyMaterial is engineered as a Second Brain platform to master frontend, backend, and AI stacks.</p>
    <p>Here is what you can do next:</p>
    <ul>
      <li>Organize lectures and study files in nesting folders under your <span class="highlight">Second Brain Workspace</span>.</li>
      <li>Create interactive <span class="highlight">Projects, Blogs, and Snippets</span> to document your learnings.</li>
      <li>Connect your <span class="highlight">GitHub Repository</span> to automatically sync release logs.</li>
    </ul>
    <p>Happy building!</p>
  `;
  return getLayout('Welcome to StudyMaterial', content);
}

export function getVerifyEmailHtml(name: string, url: string) {
  const content = `
    <h2>Verify your email address</h2>
    <p>Hi ${name},</p>
    <p>Thank you for signing up. Please verify your email address to unlock Creator capabilities and start publishing content on the platform.</p>
    <div class="btn-container">
      <a href="${url}" class="btn" target="_blank">Verify Email Address</a>
    </div>
    <p>Or copy and paste this URL into your browser:</p>
    <p style="font-family: monospace; word-break: break-all; font-size: 12px; background-color: #141417; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.03);">${url}</p>
    <p>This verification link is active for <span class="highlight">24 hours</span>.</p>
  `;
  return getLayout('Verify your email address', content);
}

export function getPasswordResetHtml(name: string, url: string) {
  const content = `
    <h2>Reset your password</h2>
    <p>Hi ${name},</p>
    <p>We received a request to reset the password associated with your account. Click the button below to specify a new password.</p>
    <div class="btn-container">
      <a href="${url}" class="btn" target="_blank">Reset Password</a>
    </div>
    <p>Or copy and paste this URL into your browser:</p>
    <p style="font-family: monospace; word-break: break-all; font-size: 12px; background-color: #141417; padding: 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.03);">${url}</p>
    <p>This link is active for <span class="highlight">30 minutes</span> and can only be used once.</p>
    <p>If you did not request a password reset, you can safely ignore this email.</p>
  `;
  return getLayout('Reset your password', content);
}

export function getPasswordChangedHtml(name: string) {
  const content = `
    <h2>Security Alert: Password Changed</h2>
    <p>Hi ${name},</p>
    <p>The password for your StudyMaterial account has been updated successfully.</p>
    <p>If you made this change, no further action is required.</p>
    <p style="color: #FF5A5F; font-weight: 600;">If you did NOT make this change, please contact security immediately to secure your account.</p>
  `;
  return getLayout('Security Alert: Password Changed', content);
}

export function getEmailChangedHtml(name: string, oldEmail: string, newEmail: string) {
  const content = `
    <h2>Security Alert: Email Changed</h2>
    <p>Hi ${name},</p>
    <p>The email address associated with your StudyMaterial account has been updated.</p>
    <p>Old Email: <span class="highlight">${oldEmail}</span></p>
    <p>New Email: <span class="highlight">${newEmail}</span></p>
    <p>If you did not make this change, please contact support immediately to secure your account.</p>
  `;
  return getLayout('Security Alert: Email Changed', content);
}

export function getVerifyNewEmailHtml(name: string, url: string) {
  const content = `
    <h2>Verify your new email address</h2>
    <p>Hi ${name},</p>
    <p>You requested to change your email address. Please click the button below to verify this new email address and complete the change.</p>
    <div class="btn-container">
      <a href="${url}" class="btn" target="_blank">Verify New Email</a>
    </div>
    <p>This verification link is active for <span class="highlight">24 hours</span>.</p>
  `;
  return getLayout('Verify your new email address', content);
}

export function getSuspiciousLoginHtml(name: string, ip: string, browser: string, os: string, location: string) {
  const content = `
    <h2>Security Alert: Suspicious Login Detected</h2>
    <p>Hi ${name},</p>
    <p>We detected a login attempt that looks different from your usual activity profile:</p>
    <ul>
      <li><strong>IP Address:</strong> ${ip}</li>
      <li><strong>Device OS:</strong> ${os}</li>
      <li><strong>Browser:</strong> ${browser}</li>
      <li><strong>Approximate Location:</strong> ${location}</li>
    </ul>
    <p>If this was you, you can safely ignore this alert. If you do not recognize this activity, please change your password immediately to protect your account.</p>
  `;
  return getLayout('Security Alert: Suspicious Login', content);
}
