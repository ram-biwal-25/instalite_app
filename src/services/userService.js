const prisma = require('../config/db');

const createUser = async (userData) => {
  const { email, name } = userData;
  return await prisma.user.create({
    data: { email, name },
  });
};

const getAllUsers = async () => {
  return await prisma.user.findMany();
};

const getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id: parseInt(id) },
  });
};

const updateUser = async (id, userData) => {
  const { email, name } = userData;
  return await prisma.user.update({
    where: { id: parseInt(id) },
    data: { email, name },
  });
};

const deleteUser = async (id) => {
  return await prisma.user.delete({
    where: { id: parseInt(id) },
  });
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
