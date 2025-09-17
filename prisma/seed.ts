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

async function seedAdminInvites() {
  if (ADMIN_EMAILS.length === 0) {
    throw new Error("No valid ADMIN_EMAIL_X entries found in .env");
  }

  if (!SEED_KEY) {
    throw new Error("Missing required env variable: ADMIN_SEED_KEY");
  }

  const existing = await prisma.seedLog.findUnique({
    where: { name: SEED_KEY },
  });

  if (existing) {
    console.log(`⚠️ Seed "${SEED_KEY}" already applied. Skipping.`);
    return;
  }

  console.log("📨 Seeding admin invites...");
  for (const email of ADMIN_EMAILS) {
    await sendAdminInvite(email);
    console.log(`Invite processed for ${email}`);
  }

  await prisma.seedLog.create({
    data: { name: SEED_KEY },
  });

  console.log(`✅ Seed "${SEED_KEY}" completed and logged.`);
}

seedAdminInvites()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error("❌ Seed script failed:", err);
    await prisma.$disconnect();
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
