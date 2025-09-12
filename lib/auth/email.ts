// lib/email.ts
import nodemailer from "nodemailer";

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.SMTP_HOST,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error) => {
  if (error) {
    console.error("SMTP configuration error:", error);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});

// Email templates
const emailTemplates = {
  verification: (verificationLink: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Jost, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; }
        .button {
          display: inline-block;
          background: #2563eb;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <h2>Welcome to Our Store!</h2>
          <p>Thank you for creating an account. Please verify your email address to complete your registration.</p>
          <p>Click the button below to verify your email:</p>
          <a href="${verificationLink}" class="button">Verify Email Address</a>
          <p>Or copy and paste this link into your browser:</p>
          <p><code>${verificationLink}</code></p>
          <p>This verification link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>If you didn't create this account, please ignore this email.</p>
          <p>© ${new Date().getFullYear()} Zami Tech Solutions. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  passwordReset: (resetLink: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; }
        .button {
          display: inline-block;
          background: #dc2626;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset</h1>
        </div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>We received a request to reset your password. Click the button below to create a new password.</p>
          <a href="${resetLink}" class="button">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p><code>${resetLink}</code></p>
          <p>This reset link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Zami Tech Solutions. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  welcome: () => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; }
        .footer {
          text-align: center;
          padding: 20px;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Our Store!</h1>
        </div>
        <div class="content">
          <h2>Thank you for joining us!</h2>
          <p>Your account has been successfully verified and is now active.</p>
          <p>You can now:</p>
          <ul>
            <li>Browse our complete product catalog</li>
            <li>Add items to your wishlist</li>
            <li>Complete purchases securely</li>
            <li>Track your orders</li>
            <li>Manage your account settings</li>
          </ul>
          <p>Start shopping now and discover amazing products!</p>
          <a href="${
            process.env.BETTER_AUTH_URL
          }" style="color: #2563eb; text-decoration: none;">Visit Our Store →</a>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Zami Tech Solutions. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

export async function sendVerificationEmail(
  email: string,
  token: string,
  userId: string
) {
  try {
    const verificationLink = `${process.env.NEXTAUTH_URL}/api/verify-email?token=${token}&userId=${userId}`;

    const mailOptions = {
      from: `"${process.env.APP_NAME || "Zami Tech"}" <${
        process.env.SMTP_USER
      }>`,
      to: email,
      subject: "Verify Your Email Address",
      html: emailTemplates.verification(verificationLink),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Verification email sent to:", email);
    return result;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error(
      "Failed to send verification email. Please try again later."
    );
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  try {
    const resetLink = `${process.env.BETTER_AUTH_URL}/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Zami Tech Solutions" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Reset Your Password",
      html: emailTemplates.passwordReset(resetLink),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent to:", email);
    return result;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
}

export async function sendWelcomeEmail(email: string) {
  try {
    const mailOptions = {
      from: `"Zami Tech Solutions" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Welcome to Our Store!",
      html: emailTemplates.welcome(),
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent to:", email);
    return result;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderDetails: any
) {
  try {
    const orderTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .order-details { margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
          </div>
          <div class="content">
            <h2>Thank you for your order!</h2>
            <p>Your order has been received and is being processed.</p>
            <div class="order-details">
              <h3>Order Details:</h3>
              <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
              <p><strong>Total Amount:</strong> $${orderDetails.total.toFixed(
                2
              )}</p>
              <p><strong>Shipping Address:</strong> ${
                orderDetails.shippingAddress
              }</p>
            </div>
            <p>You can track your order status in your account dashboard.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Zami Tech Solutions. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Zami Tech Solutions" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Order Confirmation - #${orderDetails.orderNumber}`,
      html: orderTemplate,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Order confirmation email sent to:", email);
    return result;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    throw new Error("Failed to send order confirmation email");
  }
}
