const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email
 * @param {Object} options - Email options (to, subject, text, html)
 */
const sendEmail = async (options) => {
  try {
    const message = {
      from: `${process.env.FROM_NAME || 'ShoeHub'} <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(message);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Email Send Error:', error);
    // Don't throw to prevent blocking the main flow if email fails
  }
};

/**
 * Send order confirmation email
 */
const sendOrderConfirmation = async (user, order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f3f3f3;">
        <p style="margin: 0; font-weight: bold; color: #121314;">${item.name}</p>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b6b6b; text-transform: uppercase;">Size: ${item.size} | Qty: ${item.quantity}</p>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f3f3f3; text-align: right; font-weight: bold; color: #121314;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #121314; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 24px; font-weight: bold; color: #0070d1; text-decoration: none; }
        .card { background: #ffffff; border: 1px solid #f3f3f3; border-radius: 8px; padding: 32px; }
        .order-number { font-size: 14px; color: #6b6b6b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
        .title { font-size: 28px; font-weight: 300; margin: 0 0 24px 0; }
        .table { width: 100%; border-collapse: collapse; }
        .total-row { font-size: 18px; font-weight: bold; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #6b6b6b; }
        .button { display: inline-block; background: #0070d1; color: #ffffff; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: bold; margin-top: 32px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a href="#" class="logo">SHOEHUB</a>
        </div>
        <div class="card">
          <p class="order-number">Order #${order.orderNumber}</p>
          <h1 class="title">Thank you for your order, ${user.firstName}!</h1>
          <p>We've received your order and are getting it ready for shipment. You'll receive another email with a tracking number once it's on its way.</p>
          
          <table class="table" style="margin-top: 32px;">
            ${itemsHtml}
            <tr>
              <td style="padding: 24px 0 8px 0; color: #6b6b6b;">Subtotal</td>
              <td style="padding: 24px 0 8px 0; text-align: right; color: #121314;">$${order.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b6b6b;">Shipping</td>
              <td style="padding: 8px 0; text-align: right; color: #121314;">${order.shippingCost === 0 ? 'FREE' : `$${order.shippingCost.toFixed(2)}`}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b6b6b;">Tax (8%)</td>
              <td style="padding: 8px 0; text-align: right; color: #121314;">$${order.tax.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td style="padding: 24px 0 0 0; border-top: 2px solid #121314;">Total</td>
              <td style="padding: 24px 0 0 0; border-top: 2px solid #121314; text-align: right;">$${order.total.toFixed(2)}</td>
            </tr>
          </table>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/${order._id}" class="button">View Order Status</a>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ShoeHub. All rights reserved.</p>
          <p>You are receiving this email because you made a purchase at ShoeHub.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject: `Your ShoeHub Order Confirmation - #${order.orderNumber}`,
    html
  });
};

/**
 * Send account verification email
 */
const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/verify-email/${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #121314; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 24px; font-weight: bold; color: #2563eb; text-decoration: none; letter-spacing: -1px; }
        .card { background: #ffffff; border: 1px solid #f3f3f3; border-radius: 24px; padding: 48px; text-align: center; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }
        .title { font-size: 24px; font-weight: 800; margin: 0 0 16px 0; color: #0f172a; }
        .text { color: #64748b; margin-bottom: 32px; font-size: 16px; }
        .button { display: inline-block; background: #2563eb; color: #ffffff; padding: 16px 40px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; }
        .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #94a3b8; }
        .expire { font-size: 11px; color: #94a3b8; margin-top: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">SHOEHUB</div>
        </div>
        <div class="card">
          <h1 class="title">Verify Your Account</h1>
          <p class="text">Welcome to ShoeHub, ${user.firstName}! We're excited to have you in the community. Please click the button below to verify your email address and activate your account.</p>
          
          <a href="${verificationUrl}" class="button">Verify Email</a>
          
          <p class="expire">This link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ShoeHub. All rights reserved.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Welcome to ShoeHub - Please Verify Your Email',
    html
  });
};

module.exports = {
  sendEmail,
  sendOrderConfirmation,
  sendVerificationEmail
};
