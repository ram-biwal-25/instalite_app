const prisma = require('../db');
const { formatPaginatedResponse } = require('../utils/pagination');

const userSummarySelect = {
  id: true,
  username: true,
  fullname: true,
};

const getUsers = async ({ page = 1, limit = 10, skip = 0, sortBy = 'createdAt', order = 'desc', isPrivate, search, hasPosts } = {}) => {
  const where = {};

  if (isPrivate !== undefined) {
    where.isPrivate = isPrivate;
  }

  if (hasPosts === true) {
    where.posts = { some: {} };
  } else if (hasPosts === false) {
    where.posts = { none: {} };
  }

  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { fullname: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return formatPaginatedResponse(data, page, limit, total);
};

const createUser = async (userData) => {
  const { username, email, fullname, name, bio, isPrivate } = userData;
  const resolvedUsername = username || name?.toLowerCase().replace(/\s+/g, '_') || (email ? email.split('@')[0] : 'user_' + Date.now());
  const resolvedFullname = fullname || name || resolvedUsername;
  return await prisma.user.create({
    data: {
      username: resolvedUsername,
      email,
      fullname: resolvedFullname,
      bio: bio || null,
      isPrivate: isPrivate !== undefined ? Boolean(isPrivate) : false,
    },
  });
};

const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id: parseInt(id, 10) },
    include: {
      _count: {
        select: {
          posts: true,
          likes: true,
        },
      },
    },
  });
};

const getUserPosts = async (userId, { page = 1, limit = 10, skip = 0 } = {}) => {
  const uId = parseInt(userId, 10);
  const user = await prisma.user.findUnique({ where: { id: uId } });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const where = { authorId: uId };
  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        _count: {
          select: { likes: true },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return formatPaginatedResponse(data, page, limit, total);
};

const getUserLikedPosts = async (userId, { page = 1, limit = 10, skip = 0 } = {}) => {
  const uId = parseInt(userId, 10);
  const user = await prisma.user.findUnique({ where: { id: uId } });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const where = {
    likes: {
      some: {
        userId: uId,
      },
    },
  };

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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

const updateUser = async (id, userData) => {
  const data = {};
  if (userData.username !== undefined) data.username = userData.username;
  if (userData.email !== undefined) data.email = userData.email;
  if (userData.fullname !== undefined) data.fullname = userData.fullname;
  if (userData.name !== undefined) data.fullname = userData.name;
  if (userData.bio !== undefined) data.bio = userData.bio;
  if (userData.isPrivate !== undefined) data.isPrivate = userData.isPrivate;

  return await prisma.user.update({
    where: { id: parseInt(id, 10) },
    data,
  });
};

const deleteUser = async (id) => {
  return await prisma.user.delete({
    where: { id: parseInt(id, 10) },
  });
};

module.exports = {
  getUsers,
  getAllUsers: getUsers,
  createUser,
  getUserById,
  getUserPosts,
  getUserLikedPosts,
  updateUser,
  deleteUser,
};
