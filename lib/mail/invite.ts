import { createInviteToken } from "@/data/users";
import { sendInviteEmail } from "@/lib/mail/mailer";

export async function sendAdminInvite(email: string) {
  try {
    const { token } = await createInviteToken(email);
    const inviteUrl = `${
      process.env.BETTER_AUTH_URL
    }/signup?${new URLSearchParams({
      email: email.trim().toLowerCase(),
      token,
    })}`;
    await sendInviteEmail(email, inviteUrl);
  } catch (error) {
    const e = error as Error;
    return {
      success: false,
      message: `Failed to send email: ${e}`,
    };
  }
}
