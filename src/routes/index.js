const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const postRoutes = require('./postRoutes');

router.use('/users', userRoutes);
router.use('/posts', postRoutes);

module.exports = router;
module.exports.userRoutes = userRoutes;
module.exports.postRoutes = postRoutes;
