import nodemailer from 'nodemailer';

// Default sender email
const FROM_EMAIL = process.env.EMAIL_FROM || 'QR Menus <noreply@qrmenus.app>';
const APP_NAME = 'QR Menus';
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_SECURE = process.env.SMTP_SECURE === 'true';
const SMTP_ENABLED = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

// Email types
export type EmailType = 
  | 'welcome'
  | 'email-verification'
  | 'password-reset'
  | 'subscription-confirmed'
  | 'payment-receipt'
  | 'team-invitation'
  | 'subscription-cancelled'
  | 'subscription-paused';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email via SMTP only.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  if (!SMTP_ENABLED) {
    console.warn('Email not sent. Configure SMTP env vars:', { to, subject });
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE || SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text: text || stripHtml(html),
    });

    console.log('Email sent via SMTP:', { id: info.messageId, to, subject });
    return { success: true, id: info.messageId?.toString() };
  } catch (error) {
    console.error('Email sending error (SMTP):', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Strip HTML tags for plain text version
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================
// EMAIL TEMPLATES
// ============================================

const baseStyles = `
  body { 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #1a1a1a;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  .card {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    padding: 40px;
    margin-bottom: 20px;
  }
  .header {
    text-align: center;
    margin-bottom: 30px;
  }
  .logo {
    font-size: 28px;
    font-weight: 700;
    color: #f97316;
    text-decoration: none;
  }
  h1 {
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 20px 0;
  }
  p {
    color: #4a4a4a;
    margin: 0 0 16px 0;
  }
  .button {
    display: inline-block;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    color: #ffffff !important;
    padding: 14px 32px;
    border-radius: 12px;
    text-decoration: none;
    font-weight: 600;
    font-size: 16px;
    margin: 20px 0;
  }
  .button:hover {
    background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
  }
  .highlight {
    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
    border-radius: 12px;
    padding: 20px;
    margin: 20px 0;
  }
  .highlight-text {
    font-size: 32px;
    font-weight: 700;
    color: #f97316;
    margin: 0;
  }
  .footer {
    text-align: center;
    color: #9ca3af;
    font-size: 14px;
  }
  .footer a {
    color: #f97316;
    text-decoration: none;
  }
  .divider {
    height: 1px;
    background: #e5e7eb;
    margin: 24px 0;
  }
  .detail-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
  }
  .detail-label {
    color: #6b7280;
  }
  .detail-value {
    font-weight: 600;
    color: #1a1a1a;
  }
  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }
  .badge-success {
    background: #dcfce7;
    color: #15803d;
  }
  .badge-warning {
    background: #fef3c7;
    color: #b45309;
  }
`;

/**
 * Welcome email template - sent after registration
 */
export function getWelcomeEmailTemplate(data: { 
  name: string; 
  email: string;
  verificationUrl?: string;
}) {
  const subject = `Welcome to ${APP_NAME}! 🎉`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <a href="${APP_URL}" class="logo">🍽️ ${APP_NAME}</a>
          </div>
          
          <h1>Welcome aboard, ${data.name}! 🎉</h1>
          
          <p>Thank you for joining ${APP_NAME}! We're thrilled to have you on board.</p>
          
          <p>With ${APP_NAME}, you can:</p>
          <ul style="color: #4a4a4a; padding-left: 20px;">
            <li>Create beautiful digital menus for your restaurant</li>
            <li>Generate QR codes for contactless ordering</li>
            <li>Track menu scans and analytics</li>
            <li>Collect valuable customer feedback</li>
            <li>Manage multiple restaurant profiles</li>
          </ul>
          
          ${data.verificationUrl ? `
            <p>Please verify your email address to get started:</p>
            <div style="text-align: center;">
              <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
            </div>
          ` : `
            <div style="text-align: center;">
              <a href="${APP_URL}/dashboard" class="button">Go to Dashboard</a>
            </div>
          `}
          
          <div class="divider"></div>
          
          <p style="font-size: 14px; color: #6b7280;">
            If you have any questions, don't hesitate to reach out to our support team.
          </p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
          <p><a href="${APP_URL}">Visit our website</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
}

/**
 * Password reset email template
 */
export function getPasswordResetEmailTemplate(data: {
  name: string;
  resetUrl: string;
  expiresIn: string;
}) {
  const subject = `Reset your ${APP_NAME} password`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <a href="${APP_URL}" class="logo">🍽️ ${APP_NAME}</a>
          </div>
          
          <h1>Reset Your Password 🔐</h1>
          
          <p>Hi ${data.name},</p>
          
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div style="text-align: center;">
            <a href="${data.resetUrl}" class="button">Reset Password</a>
          </div>
          
          <div class="highlight">
            <p style="margin: 0; font-size: 14px;">
              ⏰ This link will expire in <strong>${data.expiresIn}</strong>.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #6b7280;">
            If you didn't request a password reset, you can safely ignore this email. 
            Your password will remain unchanged.
          </p>
          
          <div class="divider"></div>
          
          <p style="font-size: 12px; color: #9ca3af;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${data.resetUrl}" style="color: #f97316; word-break: break-all;">${data.resetUrl}</a>
          </p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
}

/**
 * Subscription confirmed email template
 */
export function getSubscriptionConfirmedEmailTemplate(data: {
  name: string;
  plan: string;
  price: string;
  currency: string;
  expiresAt: string;
  features: string[];
}) {
  const subject = `Your ${APP_NAME} ${data.plan} subscription is active! 🚀`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <a href="${APP_URL}" class="logo">🍽️ ${APP_NAME}</a>
          </div>
          
          <h1>Subscription Confirmed! 🎊</h1>
          
          <p>Hi ${data.name},</p>
          
          <p>Great news! Your <strong>${data.plan}</strong> subscription is now active.</p>
          
          <div class="highlight">
            <p class="highlight-text">${data.plan} Plan</p>
            <p style="margin: 10px 0 0 0; color: #6b7280;">
              ${data.price} ${data.currency}/month
            </p>
          </div>
          
          <h3 style="margin-top: 30px;">What's included:</h3>
          <ul style="color: #4a4a4a; padding-left: 20px;">
            ${data.features.map(f => `<li>${f}</li>`).join('')}
          </ul>
          
          <div style="background: #f9fafb; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <div class="detail-row" style="border: none;">
              <span class="detail-label">Next billing date</span>
              <span class="detail-value">${data.expiresAt}</span>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${APP_URL}/dashboard" class="button">Go to Dashboard</a>
          </div>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
          <p><a href="${APP_URL}/dashboard/settings/subscription">Manage Subscription</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
}

/**
 * Payment receipt email template
 */
export function getPaymentReceiptEmailTemplate(data: {
  name: string;
  amount: string;
  currency: string;
  plan: string;
  paymentDate: string;
  paymentMethod: string;
  invoiceNumber: string;
  periodStart: string;
  periodEnd: string;
}) {
  const subject = `Payment Receipt - ${APP_NAME}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <a href="${APP_URL}" class="logo">🍽️ ${APP_NAME}</a>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 30px;">
            <div>
              <h1 style="margin: 0;">Payment Receipt</h1>
              <p style="margin: 5px 0 0 0; color: #6b7280;">Invoice #${data.invoiceNumber}</p>
            </div>
            <span class="badge badge-success">PAID</span>
          </div>
          
          <p>Hi ${data.name},</p>
          <p>Thank you for your payment. Here's your receipt:</p>
          
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <div class="detail-row">
              <span class="detail-label">Plan</span>
              <span class="detail-value">${data.plan}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount</span>
              <span class="detail-value">${data.amount} ${data.currency}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Date</span>
              <span class="detail-value">${data.paymentDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Method</span>
              <span class="detail-value">${data.paymentMethod}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Billing Period</span>
              <span class="detail-value">${data.periodStart} - ${data.periodEnd}</span>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <p style="font-size: 14px; color: #6b7280;">
            This receipt confirms your payment. Keep it for your records.
          </p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
          <p><a href="${APP_URL}/dashboard/settings">View billing history</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
}

/**
 * Team invitation email template
 */
export function getTeamInvitationEmailTemplate(data: {
  inviterName: string;
  restaurantName: string;
  role: string;
  inviteUrl: string;
  expiresIn: string;
}) {
  const subject = `You've been invited to join ${data.restaurantName} on ${APP_NAME}`;
  
  const roleDescriptions: Record<string, string> = {
    MANAGER: 'Full access to manage the restaurant, menus, and team (except billing)',
    STAFF: 'View and update menu items and categories',
    VIEWER: 'View-only access to the restaurant dashboard',
  };
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <a href="${APP_URL}" class="logo">🍽️ ${APP_NAME}</a>
          </div>
          
          <h1>You're Invited! 🎉</h1>
          
          <p><strong>${data.inviterName}</strong> has invited you to join <strong>${data.restaurantName}</strong> on ${APP_NAME}.</p>
          
          <div class="highlight">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Your role</p>
            <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: 700; color: #f97316;">
              ${data.role}
            </p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #4a4a4a;">
              ${roleDescriptions[data.role] || 'Team member access'}
            </p>
          </div>
          
          <div style="text-align: center;">
            <a href="${data.inviteUrl}" class="button">Accept Invitation</a>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; text-align: center;">
            This invitation expires in ${data.expiresIn}.
          </p>
          
          <div class="divider"></div>
          
          <p style="font-size: 12px; color: #9ca3af;">
            If you don't want to join, you can simply ignore this email.
          </p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
}

/**
 * Subscription cancelled email template
 */
export function getSubscriptionCancelledEmailTemplate(data: {
  name: string;
  plan: string;
  endDate: string;
}) {
  const subject = `Your ${APP_NAME} subscription has been cancelled`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <a href="${APP_URL}" class="logo">🍽️ ${APP_NAME}</a>
          </div>
          
          <h1>Subscription Cancelled 😢</h1>
          
          <p>Hi ${data.name},</p>
          
          <p>Your <strong>${data.plan}</strong> subscription has been cancelled as requested.</p>
          
          <div class="highlight">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              You'll continue to have access until:
            </p>
            <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: 700; color: #f97316;">
              ${data.endDate}
            </p>
          </div>
          
          <p>After this date, your account will revert to the Free plan with limited features.</p>
          
          <p>We're sorry to see you go! If you change your mind, you can always resubscribe:</p>
          
          <div style="text-align: center;">
            <a href="${APP_URL}/dashboard/settings/plans" class="button">View Plans</a>
          </div>
          
          <div class="divider"></div>
          
          <p style="font-size: 14px; color: #6b7280;">
            If you cancelled by mistake or have feedback for us, please contact our support team.
          </p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
}

/**
 * Subscription paused email template
 */
export function getSubscriptionPausedEmailTemplate(data: {
  name: string;
  plan: string;
  resumeDate: string;
}) {
  const subject = `Your ${APP_NAME} subscription has been paused`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <a href="${APP_URL}" class="logo">🍽️ ${APP_NAME}</a>
          </div>
          
          <h1>Subscription Paused ⏸️</h1>
          
          <p>Hi ${data.name},</p>
          
          <p>Your <strong>${data.plan}</strong> subscription has been paused.</p>
          
          <div class="highlight">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              Your subscription will automatically resume on:
            </p>
            <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: 700; color: #f97316;">
              ${data.resumeDate}
            </p>
          </div>
          
          <p>During the pause:</p>
          <ul style="color: #4a4a4a; padding-left: 20px;">
            <li>Your menus remain visible to customers</li>
            <li>You won't be charged</li>
            <li>You can resume anytime</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${APP_URL}/dashboard/settings/subscription" class="button">Manage Subscription</a>
          </div>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return { subject, html };
}
