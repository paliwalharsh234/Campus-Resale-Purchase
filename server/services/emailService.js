const { Resend } = require('resend');

/**
 * Send an email using Resend (primary) or nodemailer Gmail (fallback).
 * Resend has much better deliverability for college email servers.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  // ── Resend (primary) ────────────────────────────────────────────────────────
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: 'Campus Resale <onboarding@resend.dev>',
        to,
        subject,
        html,
        text,
      });

      if (error) {
        console.error(`⚠️ Resend error sending to ${to}:`, error);
        return null;
      }

      console.log(`✉️ Email sent via Resend to ${to}: ${data?.id || 'OK'}`);
      return data;
    } catch (err) {
      console.error(`⚠️ Resend exception sending to ${to}:`, err.message);
      return null;
    }
  }

  // ── Nodemailer Gmail (fallback if RESEND_API_KEY not set) ───────────────────
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const info = await transporter.sendMail({
        from: `"Campus Resale & Purchase" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text,
      });

      console.log(`✉️ Email sent via Gmail to ${to}: ${info.messageId}`);
      return info;
    } catch (err) {
      console.error(`⚠️ Gmail sending failed to ${to}:`, err.message);
      return null;
    }
  }

  // ── No email provider configured ─────────────────────────────────────────────
  console.warn(`📧 [EMAIL SKIPPED] No email provider configured. Would have sent "${subject}" to ${to}`);
  return null;
};

/**
 * Send verification email
 */
const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #4f46e5;">Welcome to Campus Resale, ${name}!</h2>
      <p>Thank you for joining your campus marketplace. Please verify your official college email address to activate your account.</p>
      <div style="margin: 24px 0;">
        <a href="${verifyUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link in your browser:</p>
      <p style="color: #4b5563; font-size: 12px; word-break: break-all;">${verifyUrl}</p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">This link will expire in 24 hours. If you did not register, please ignore this email.</p>
    </div>
  `;
  const text = `Welcome to Campus Resale! Verify your account here: ${verifyUrl}`;
  return await sendEmail({ to: email, subject: 'Verify Your Campus Email - Campus Resale', html, text });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #4f46e5;">Password Reset Request</h2>
      <p>Hello ${name}, we received a request to reset your password for Campus Resale.</p>
      <div style="margin: 24px 0;">
        <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link in your browser:</p>
      <p style="color: #4b5563; font-size: 12px; word-break: break-all;">${resetUrl}</p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
    </div>
  `;
  const text = `Reset your Campus Resale password here: ${resetUrl}`;
  return await sendEmail({ to: email, subject: 'Reset Your Password - Campus Resale', html, text });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};
