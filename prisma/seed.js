const prisma = require('../src/db');
const { users, posts } = require('./seed-data');

async function seed() {
  try {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    const userResult = await prisma.user.createMany({
      data: users,
    });

    const postResult = await prisma.post.createMany({
      data: posts,
    });

    console.log(`Seeded ${userResult.count} users and ${postResult.count} posts`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    if (process.exitCode === 1) {
      process.exit(1);
    }
  }
}

seed();
