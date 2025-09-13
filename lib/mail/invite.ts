import { createInviteToken } from "@/data/users";
import { sendInviteEmail } from "@/lib/mail/mailer";

export async function sendAdminInvite(email: string) {
  try {
    const { token } = await createInviteToken(email);

    const params = new URLSearchParams({
      email: email.trim().toLowerCase(),
      token: token,
    });

    const inviteUrl = `${
      process.env.BETTER_AUTH_URL
    }/admin/signup?${params.toString()}`;

    await sendInviteEmail(email, inviteUrl);

    return { success: true, message: `Invite sent to ${email}` };
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: `Failed to send email: ${e}`,
    };
  }
}
