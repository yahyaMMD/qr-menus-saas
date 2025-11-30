import { Role, PrismaClient } from '@prisma/client';
import { hashPassword } from '../../lib/auth/password';

export default async function users(prisma: PrismaClient) {
  console.log("👤 Creating users...");

  const admin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@qrmenus.test",
      password: await hashPassword("Admin@2025"),
      role: Role.ADMIN,
    }
  });

  const owner = await prisma.user.create({
    data: {
      name: "Owner User",
      email: "owner@qrmenus.test",
      password: await hashPassword("Owner@2025"),
      role: Role.RESTAURANT_OWNER,
    }
  });

  const user = await prisma.user.create({
    data: {
      name: "Normal User",
      email: "user@qrmenus.test",
      password: await hashPassword("User@2025"),
      role: Role.USER,
    }
  });

  const normalUsers = await prisma.user.createMany({
    data: [
      { name: "Arezki Belkacem", email: "ab@test.com", password: await hashPassword("pass123"), role: Role.USER },
      { name: "Lina Kerroum", email: "lina@test.com", password: await hashPassword("pass123"), role: Role.USER },
      { name: "Walid Tahar", email: "walid@test.com", password: await hashPassword("pass123"), role: Role.USER },
    ]
  });

  console.log("✅ Users created.");
  return { admin, owner, user };
}
