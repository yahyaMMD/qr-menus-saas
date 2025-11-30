import { TicketStatus, PrismaClient } from "@prisma/client";

export default async function support(prisma: PrismaClient) {
  console.log("🎫 Creating sample support tickets...");

  const user = await prisma.user.findFirst();

  if (!user) {
    console.warn("⚠️ No user found. Skipping support ticket seeding.");
    return;
  }

  await prisma.supportTicket.create({
    data: {
      userId: user.id,
      subject: "QR Code not generating",
      message: "I cannot generate the QR code for my menu.",
      status: TicketStatus.OPEN
    }
  });

  console.log("🎫 Support tickets created.");
}
