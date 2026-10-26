const usersService = require('../services/users.service');
const { parsePagination } = require('../utils/pagination');

const getUsers = async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ error: pagination.error });
    }
    const { page, limit, skip } = pagination;

    const allowedSortBy = ['createdAt', 'username', 'fullname'];
    const sortBy = req.query.sortBy || 'createdAt';
    if (req.query.sortBy !== undefined && !allowedSortBy.includes(req.query.sortBy)) {
      return res.status(400).json({ error: 'sortBy must be one of: createdAt, username, fullname' });
    }

    const allowedOrder = ['asc', 'desc'];
    const order = req.query.order || 'desc';
    if (req.query.order !== undefined && !allowedOrder.includes(req.query.order)) {
      return res.status(400).json({ error: 'order must be asc or desc' });
    }

    let isPrivate;
    if (req.query.isPrivate !== undefined) {
      if (req.query.isPrivate === 'true') {
        isPrivate = true;
      } else if (req.query.isPrivate === 'false') {
        isPrivate = false;
      } else {
        return res.status(400).json({ error: 'isPrivate must be true or false' });
      }
    }

    let hasPosts;
    if (req.query.hasPosts !== undefined) {
      if (req.query.hasPosts === 'true') {
        hasPosts = true;
      } else if (req.query.hasPosts === 'false') {
        hasPosts = false;
      } else {
        return res.status(400).json({ error: 'hasPosts must be true or false' });
      }
    }

    const result = await usersService.getUsers({
      page,
      limit,
      skip,
      sortBy,
      order,
      isPrivate,
      search: req.query.search,
      hasPosts,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const user = await usersService.createUser(req.body || {});
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await usersService.getUserById(id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ error: pagination.error });
    }
    const { page, limit, skip } = pagination;

    const result = await usersService.getUserPosts(req.params.id, { page, limit, skip });
    res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const getUserLikedPosts = async (req, res) => {
  try {
    const pagination = parsePagination(req.query);
    if (pagination.error) {
      return res.status(400).json({ error: pagination.error });
    }
    const { page, limit, skip } = pagination;

    const result = await usersService.getUserLikedPosts(req.params.id, { page, limit, skip });
    res.json(result);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await usersService.updateUser(id, req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await usersService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
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
