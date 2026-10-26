const postsService = require('../services/posts.service');

const isPositiveInteger = (val) => {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!/^\d+$/.test(trimmed)) return false;
  const num = parseInt(trimmed, 10);
  return num > 0 && String(num) === trimmed;
};

const isValidDate = (val) => {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  const d = new Date(trimmed);
  return !isNaN(d.getTime());
};

const getPosts = async (req, res) => {
  try {
    const { page: pageQuery, limit: limitQuery, sortBy: sortByQuery, order: orderQuery, location, search, from, to } = req.query;

    if (pageQuery !== undefined && !isPositiveInteger(pageQuery)) {
      return res.status(400).json({ error: 'page and limit must be positive integers' });
    }
    if (limitQuery !== undefined && !isPositiveInteger(limitQuery)) {
      return res.status(400).json({ error: 'page and limit must be positive integers' });
    }

    let page = pageQuery !== undefined ? parseInt(pageQuery, 10) : 1;
    let limit = limitQuery !== undefined ? parseInt(limitQuery, 10) : 10;
    if (limit > 50) {
      limit = 50;
    }

    const allowedSortBy = ['createdAt', 'updatedAt'];
    const sortBy = sortByQuery || 'createdAt';
    if (sortByQuery !== undefined && !allowedSortBy.includes(sortByQuery)) {
      return res.status(400).json({ error: 'sortBy must be one of: createdAt, updatedAt' });
    }

    const allowedOrder = ['asc', 'desc'];
    const order = orderQuery || 'desc';
    if (orderQuery !== undefined && !allowedOrder.includes(orderQuery)) {
      return res.status(400).json({ error: 'order must be asc or desc' });
    }

    if (from !== undefined && !isValidDate(from)) {
      return res.status(400).json({ error: 'from and to must be valid dates' });
    }
    if (to !== undefined && !isValidDate(to)) {
      return res.status(400).json({ error: 'from and to must be valid dates' });
    }

    const result = await postsService.getPosts({
      page,
      limit,
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
    const post = await postsService.createPost(req.body);
    res.status(201).json(post);
  } catch (error) {
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
    const post = await postsService.updatePost(id, req.body);
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deletePost = async (req, res) => {
  const { id } = req.params;
  try {
    await postsService.deletePost(id);
    res.status(204).send();
  } catch (error) {
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
