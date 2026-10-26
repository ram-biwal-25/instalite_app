const usersService = require('../services/users.service');

const isPositiveInteger = (val) => {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!/^\d+$/.test(trimmed)) return false;
  const num = parseInt(trimmed, 10);
  return num > 0 && String(num) === trimmed;
};

const getUsers = async (req, res) => {
  try {
    const { page: pageQuery, limit: limitQuery, sortBy: sortByQuery, order: orderQuery, isPrivate: isPrivateQuery, search } = req.query;

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

    const allowedSortBy = ['createdAt', 'username', 'fullname'];
    const sortBy = sortByQuery || 'createdAt';
    if (sortByQuery !== undefined && !allowedSortBy.includes(sortByQuery)) {
      return res.status(400).json({ error: 'sortBy must be one of: createdAt, username, fullname' });
    }

    const allowedOrder = ['asc', 'desc'];
    const order = orderQuery || 'desc';
    if (orderQuery !== undefined && !allowedOrder.includes(orderQuery)) {
      return res.status(400).json({ error: 'order must be asc or desc' });
    }

    let isPrivate;
    if (isPrivateQuery !== undefined) {
      if (isPrivateQuery === 'true') {
        isPrivate = true;
      } else if (isPrivateQuery === 'false') {
        isPrivate = false;
      } else {
        return res.status(400).json({ error: 'isPrivate must be true or false' });
      }
    }

    const result = await usersService.getUsers({
      page,
      limit,
      sortBy,
      order,
      isPrivate,
      search,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const user = await usersService.createUser(req.body);
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
  updateUser,
  deleteUser,
};
