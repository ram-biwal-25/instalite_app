const postsService = require('../services/posts.service');
const { parsePagination } = require('../utils/pagination');

const isValidDate = (val) => {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  const d = new Date(trimmed);
  return !isNaN(d.getTime());
};

const getPosts = async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ error: pagination.error });
    }
    const { page, limit, skip } = pagination;

    const allowedSortBy = ['createdAt', 'updatedAt', 'likes'];
    const sortBy = req.query.sortBy || 'createdAt';
    if (req.query.sortBy !== undefined && !allowedSortBy.includes(req.query.sortBy)) {
      return res.status(400).json({ error: 'sortBy must be one of: createdAt, updatedAt, likes' });
    }

    const allowedOrder = ['asc', 'desc'];
    const order = req.query.order || 'desc';
    if (req.query.order !== undefined && !allowedOrder.includes(req.query.order)) {
      return res.status(400).json({ error: 'order must be asc or desc' });
    }

    const { location, search, from, to } = req.query;

    if (from !== undefined && !isValidDate(from)) {
      return res.status(400).json({ error: 'from and to must be valid dates' });
    }
    if (to !== undefined && !isValidDate(to)) {
      return res.status(400).json({ error: 'from and to must be valid dates' });
    }

    const result = await postsService.getPosts({
      page,
      limit,
      skip,
      sortBy,
      order,
      location,
      search,
      from,
      to,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const { imageUrl, authorId, caption, location } = req.body || {};
    if (!imageUrl || authorId === undefined || authorId === null || authorId === '') {
      return res.status(400).json({ error: 'imageUrl and authorId are required' });
    }

    const post = await postsService.createPost({ imageUrl, authorId, caption, location });
    res.status(201).json(post);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};

const getPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await postsService.getPostById(id);
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ error: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updatePost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await postsService.updatePost(id, req.body || {});
    res.json(post);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};

const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    await postsService.deletePost(id);
    res.status(204).send();
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getPosts,
  getAllPosts: getPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
};
