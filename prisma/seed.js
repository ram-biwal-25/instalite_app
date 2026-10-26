const prisma = require('../src/db');
const { users, posts, likes } = require('./seed-data');

async function seed() {
  try {
    // 1. Delete children first: likes, then posts, then users
    await prisma.like.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    // 2. Create all users and return rows with ids
    const createdUsers = await prisma.user.createManyAndReturn({
      data: users,
    });

    // 3. Lookup: username -> id
    const userLookup = {};
    for (const u of createdUsers) {
      userLookup[u.username] = u.id;
    }

    // 4. Create posts with real authorId
    const postData = posts.map((p) => {
      const { author, ...rest } = p;
      return {
        ...rest,
        authorId: userLookup[author],
      };
    });
    const createdPosts = await prisma.post.createManyAndReturn({
      data: postData,
    });

    // 5. Lookup: insta## -> post id
    const postLookup = {};
    for (const p of createdPosts) {
      const match = p.imageUrl.match(/insta\d+/);
      if (match) {
        postLookup[match[0]] = p.id;
      }
    }

    // 6. Create all likes
    const likeData = likes.map((l) => ({
      userId: userLookup[l.user],
      postId: postLookup[l.post],
    }));
    const createdLikes = await prisma.like.createManyAndReturn({
      data: likeData,
    });

    const userCount = createdUsers.length;
    const postCount = createdPosts.length;
    const likeCount = createdLikes.length;

    // 7. Print message with returned counts
    console.log(`🌱 Seeded ${userCount} users, ${postCount} posts and ${likeCount} likes`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    // 8. Disconnect client
    await prisma.$disconnect();
    if (process.exitCode === 1) {
      process.exit(1);
    }
  }
}

seed();
