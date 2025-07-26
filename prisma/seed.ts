import { sendAdminInvite } from "@/lib/mail/invite";
import prisma from "@/lib/prisma";

const SEED_KEY = process.env.ADMIN_SEED_KEY;

const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL_1,
  process.env.ADMIN_EMAIL_2,
  process.env.ADMIN_EMAIL_3,
]
  .filter((email): email is string => !!email?.trim())
  .map((email) => email.trim().toLowerCase());

if (ADMIN_EMAILS.length === 0) {
  throw new Error("No valid ADMIN_EMAIL_X entries found in .env");
}

async function seedAdminInvites() {
  const existing = await prisma.seedLog.findUnique({
    where: { name: SEED_KEY },
  });

  if (existing) {
    console.log(`⚠️ Seed "${SEED_KEY}" already applied. Skipping.`);
    return;
  }

  console.log("📨 Seeding admin invites...");
  for (const email of ADMIN_EMAILS) {
    try {
      await sendAdminInvite(email);
      console.log(`Invite processed for ${ADMIN_EMAILS.length}`);
    } catch (error) {
      const e = error as Error;
      console.error(`Failed to send invite to ${email}: ${e.message}`);
      process.exit(1);
    }
  }

  if (!SEED_KEY) {
    throw new Error("Missing required env variable: ADMIN_SEED_KEY");
  }

  await prisma.seedLog.create({
    data: { name: SEED_KEY },
  });

  console.log(`Seed "${SEED_KEY}" completed and logged.`);
}

seedAdminInvites()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed script failed:", err);
    process.exit(1);
  });
