const prisma = require('../db');

const getUsers = async ({ page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', isPrivate, search } = {}) => {
  const where = {};

  if (isPrivate !== undefined) {
    where.isPrivate = isPrivate;
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
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
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

const createUser = async (userData) => {
  const { username, email, fullname, name, bio, isPrivate } = userData;
  const resolvedUsername = username || name?.toLowerCase().replace(/\s+/g, '_') || (email ? email.split('@')[0] : 'user_' + Date.now());
  const resolvedFullname = fullname || name || resolvedUsername;
  return await prisma.user.create({
    data: {
      username: resolvedUsername,
      email,
      fullname: resolvedFullname,
      bio,
      isPrivate: isPrivate !== undefined ? Boolean(isPrivate) : false,
    },
  });
};

const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id: parseInt(id, 10) },
  });
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
  updateUser,
  deleteUser,
};
