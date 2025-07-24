import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.customer.createMany({
    data: [
      {
        name: "Alice Mwangi",
        email: "alice@example.com",
        phone: "+254712345678",
        status: "ACTIVE",
        joinDate: new Date("2023-01-10T10:00:00Z"),
        totalSpent: 150000,
      },
      {
        name: "Brian Otieno",
        email: "brian@example.com",
        phone: "+254722334455",
        status: "INACTIVE",
        joinDate: new Date("2022-11-05T09:30:00Z"),
        totalSpent: 23000.5,
      },
      {
        name: "Caroline Njeri",
        email: "caroline@example.com",
        phone: "+254733445566",
        status: "ACTIVE",
        joinDate: new Date("2023-06-20T14:20:00Z"),
        totalSpent: 78999.99,
      },
      {
        name: "David Kiptoo",
        email: "david@example.com",
        phone: "+254701223344",
        status: "ACTIVE",
        joinDate: new Date("2024-01-15T08:00:00Z"),
        totalSpent: 0,
      },
      {
        name: "Esther Wambui",
        email: "esther@example.com",
        phone: "+254745667788",
        status: "ACTIVE",
        joinDate: new Date("2023-12-01T16:45:00Z"),
        totalSpent: 15000,
      },
    ],
  });

  console.log("✅ Customers seeded successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
