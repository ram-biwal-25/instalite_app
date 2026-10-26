const prisma = require('../db');
const { formatPaginatedResponse } = require('../utils/pagination');

const userSummarySelect = {
  id: true,
  username: true,
  fullname: true,
};

const getPosts = async ({ page = 1, limit = 10, skip = 0, sortBy = 'createdAt', order = 'desc', location, search, from, to } = {}) => {
  const where = {};

  if (location) {
    where.location = { equals: location, mode: 'insensitive' };
  }

  if (search) {
    where.caption = { contains: search, mode: 'insensitive' };
  }

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lt = new Date(to);
  }

  let orderBy;
  if (sortBy === 'likes') {
    orderBy = [
      { likes: { _count: order } },
      { createdAt: 'desc' },
    ];
  } else {
    orderBy = { [sortBy]: order };
  }

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: {
          select: userSummarySelect,
        },
        _count: {
          select: { likes: true },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return formatPaginatedResponse(data, page, limit, total);
};

const createPost = async ({ imageUrl, authorId, caption, location }) => {
  const authorIdInt = parseInt(authorId, 10);
  const author = await prisma.user.findUnique({
    where: { id: authorIdInt },
  });
  if (!author) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  return await prisma.post.create({
    data: {
      imageUrl,
      authorId: authorIdInt,
      caption: caption || null,
      location: location || null,
    },
  });
};

const getPostById = async (id) => {
  const pId = parseInt(id, 10);
  return await prisma.post.findUnique({
    where: { id: pId },
    include: {
      author: {
        select: userSummarySelect,
      },
      _count: {
        select: { likes: true },
      },
    },
  });
};

const updatePost = async (id, postData) => {
  const pId = parseInt(id, 10);
  const existing = await prisma.post.findUnique({ where: { id: pId } });
  if (!existing) {
    const error = new Error('Post not found');
    error.status = 404;
    throw error;
  }

  const data = {};
  if (postData.imageUrl !== undefined) data.imageUrl = postData.imageUrl;
  if (postData.caption !== undefined) data.caption = postData.caption;
  if (postData.location !== undefined) data.location = postData.location;

  return await prisma.post.update({
    where: { id: pId },
    data,
  });
};

const deletePost = async (id) => {
  const pId = parseInt(id, 10);
  const existing = await prisma.post.findUnique({ where: { id: pId } });
  if (!existing) {
    const error = new Error('Post not found');
    error.status = 404;
    throw error;
  }
  return await prisma.post.delete({
    where: { id: pId },
  });
};

module.exports = {
  getPosts,
  getAllPosts: getPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
};
