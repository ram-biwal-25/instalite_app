const likesService = require('../services/likes.service');

const getPostLikes = async (req, res) => {
  try {
    const { id } = req.params;
    const users = await likesService.getPostLikes(id);
    res.json(users);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body || {};

    if (!userId || userId === undefined) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const like = await likesService.likePost(id, userId);
    res.status(201).json(like);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

const unlikePost = async (req, res) => {
  try {
    const { id, userId } = req.params;
    await likesService.unlikePost(id, userId);
    res.status(204).send();
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getPostLikes,
  likePost,
  unlikePost,
};
