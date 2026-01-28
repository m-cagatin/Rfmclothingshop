import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listAllUsers() {
  try {
    const users = await prisma.users.findMany({
      select: { 
        UserId: true, 
        Email: true, 
        FullName: true 
      },
      orderBy: { UserId: 'asc' }
    });

    console.log(`Total users in database: ${users.length}\n`);
    users.forEach(u => {
      console.log(`ID ${u.UserId}: ${u.Email}`);
      console.log(`   Name: ${u.FullName}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAllUsers();
