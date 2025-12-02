import 'dotenv/config';
import argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

function generateId() {
  return randomBytes(16).toString('hex');
}

async function main() {
  const adminEmail = 'admin@rfm.com';
  
  // Delete existing admin if corrupted
  await prisma.user.deleteMany({ where: { email: adminEmail } });
  console.log('Cleaned up existing admin user');

  const passwordHash = await argon2.hash('admin123');
  console.log('Generated hash:', passwordHash.substring(0, 50) + '...');

  await prisma.user.create({
    data: {
      id: generateId(),
      name: 'Admin User',
      email: adminEmail,
      passwordHash,
      role: 'admin',
      emailVerified: true,
    },
  });

  console.log('Seeded admin user admin@rfm.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
