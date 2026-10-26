const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts.controller');
const likesController = require('../controllers/likes.controller');

router.post('/', postsController.createPost);
router.get('/', postsController.getPosts);
router.get('/:id', postsController.getPostById);
router.patch('/:id', postsController.updatePost);
router.delete('/:id', postsController.deletePost);

// Likes routes
router.get('/:id/likes', likesController.getPostLikes);
router.post('/:id/likes', likesController.likePost);
router.delete('/:id/likes/:userId', likesController.unlikePost);

module.exports = router;
