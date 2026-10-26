const prisma = require('../config/db');

const createPost = async (postData) => {
  const { title, content, authorId } = postData;
  return await prisma.post.create({
    data: {
      title,
      content,
      authorId: typeof authorId === 'string' ? parseInt(authorId) : authorId,
    },
  });
};

const getAllPosts = async () => {
  return await prisma.post.findMany();
};

const getPostById = async (id) => {
  return await prisma.post.findUnique({
    where: { id: parseInt(id) },
  });
};

const updatePost = async (id, postData) => {
  const { title, content } = postData;
  return await prisma.post.update({
    where: { id: parseInt(id) },
    data: { title, content },
  });
};

const deletePost = async (id) => {
  return await prisma.post.delete({
    where: { id: parseInt(id) },
  });
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
};
