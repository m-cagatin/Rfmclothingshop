import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findUser() {
  try {
    // Search for users with similar email patterns
    const users = await prisma.users.findMany({
      where: {
        OR: [
          { Email: { contains: 'cagatin' } },
          { Email: { contains: 'm.cagatin' } },
          { Email: { contains: '512024' } },
        ]
      },
      select: { 
        UserId: true, 
        Email: true, 
        FullName: true,
        created_at: true
      }
    });

    console.log(`Found ${users.length} user(s) matching pattern:\n`);
    users.forEach(user => {
      console.log(`ID: ${user.UserId}`);
      console.log(`Email: ${user.Email}`);
      console.log(`Name: ${user.FullName}`);
      console.log(`Created: ${user.created_at}`);
      console.log('---');
    });

    // Also show all users if none found
    if (users.length === 0) {
      console.log('No matching users found. Here are all users:\n');
      const allUsers = await prisma.users.findMany({
        select: { 
          UserId: true, 
          Email: true, 
          FullName: true 
        },
        take: 10
      });
      allUsers.forEach(user => {
        console.log(`${user.UserId}: ${user.Email} (${user.FullName})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

findUser();
