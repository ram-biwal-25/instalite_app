const prisma = require('../db');

const getPosts = async ({ page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', location, search, from, to } = {}) => {
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

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

const createPost = async (postData) => {
  const { imageUrl, caption, location, title, content, authorId, userId } = postData;
  return await prisma.post.create({
    data: {
      imageUrl: imageUrl || 'https://picsum.photos/seed/default/600/600',
      caption: caption !== undefined ? caption : (title || content || null),
      location: location || null,
      userId: userId ? parseInt(userId, 10) : (authorId ? parseInt(authorId, 10) : undefined),
    },
  });
};

const getPostById = async (id) => {
  return await prisma.post.findUnique({
    where: { id: parseInt(id, 10) },
  });
};

const updatePost = async (id, postData) => {
  const data = {};
  if (postData.imageUrl !== undefined) data.imageUrl = postData.imageUrl;
  if (postData.caption !== undefined) data.caption = postData.caption;
  if (postData.location !== undefined) data.location = postData.location;
  if (postData.title !== undefined || postData.content !== undefined) {
    data.caption = postData.caption || postData.title || postData.content;
  }
  return await prisma.post.update({
    where: { id: parseInt(id, 10) },
    data,
  });
};

const deletePost = async (id) => {
  return await prisma.post.delete({
    where: { id: parseInt(id, 10) },
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
