const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');

router.post('/', usersController.createUser);
router.get('/', usersController.getUsers);
router.get('/:id', usersController.getUserById);
router.patch('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

// Relations routes
router.get('/:id/posts', usersController.getUserPosts);
router.get('/:id/liked-posts', usersController.getUserLikedPosts);

module.exports = router;
