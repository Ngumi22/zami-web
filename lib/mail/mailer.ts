import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.SMTP_HOST,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendInviteEmail(email: string, link: string) {
  const appName = process.env.APP_NAME;

  try {
    await transporter.sendMail({
      from: {
        name: appName as string,
        address: process.env.SMTP_USER as string,
      },
      to: email,
      subject: `${appName} Admin Invite`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">You've been invited!</h2>
          <p>You have been invited to join <strong>${appName}</strong> as an administrator.</p>
          <p style="margin: 25px 0;">
            <a href="${link}"
               style="padding: 12px 20px; background: #6366f1; color: white;
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              Accept Invitation
            </a>
          </p>
          <p style="color: #666; font-size: 0.9em;">
            This link will expire in 24 hours. If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    });
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: `Failed to send email to ${email}: ${e}`,
    };
  }
}
