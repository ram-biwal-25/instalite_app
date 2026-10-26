const prisma = require('../db');

const userSummarySelect = {
  id: true,
  username: true,
  fullname: true,
};

const getPostLikes = async (postId) => {
  const pId = parseInt(postId, 10);
  const post = await prisma.post.findUnique({
    where: { id: pId },
  });
  if (!post) {
    const error = new Error('Post not found');
    error.status = 404;
    throw error;
  }

  const users = await prisma.user.findMany({
    where: {
      likes: {
        some: {
          postId: pId,
        },
      },
    },
    select: userSummarySelect,
    orderBy: {
      username: 'asc',
    },
  });

  return users;
};

const likePost = async (postId, userId) => {
  const pId = parseInt(postId, 10);
  const uId = parseInt(userId, 10);

  // Check post exists
  const post = await prisma.post.findUnique({ where: { id: pId } });
  if (!post) {
    const error = new Error('Post not found');
    error.status = 404;
    throw error;
  }

  // Check user exists
  const user = await prisma.user.findUnique({ where: { id: uId } });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  try {
    return await prisma.like.create({
      data: {
        postId: pId,
        userId: uId,
      },
      select: {
        userId: true,
        postId: true,
        createdAt: true,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      const error = new Error('Already liked');
      error.status = 409;
      throw error;
    }
    throw err;
  }
};

const unlikePost = async (postId, userId) => {
  const pId = parseInt(postId, 10);
  const uId = parseInt(userId, 10);

  try {
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId: uId,
          postId: pId,
        },
      },
    });
  } catch (err) {
    if (err.code === 'P2025') {
      const error = new Error('Like not found');
      error.status = 404;
      throw error;
    }
    throw err;
  }
};

module.exports = {
  getPostLikes,
  likePost,
  unlikePost,
};
