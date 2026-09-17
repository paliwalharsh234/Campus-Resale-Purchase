const createTransport = require('../config/email');

/**
 * Send an email using the configured transport
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransport();
    const mailOptions = {
      from: `"Campus Resale & Purchase" <${process.env.EMAIL_USER || 'noreply@campusresale.com'}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent to ${to}: ${info.messageId || 'OK'}`);
    return info;
  } catch (error) {
    console.error(`⚠️ Email sending failed to ${to}:`, error.message);
    // In dev / test we don't necessarily want to block registration if SMTP isn't configured yet
    if (process.env.NODE_ENV === 'development') {
      console.log('ℹ️ [DEV NOTE] Check console or mock for the verification / reset token');
    }
    return null;
  }
};

/**
 * Send verification email
 */
const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 8px;">
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 8px;">
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
