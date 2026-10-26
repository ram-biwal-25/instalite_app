require('dotenv').config();
const express = require('express');
const usersRoutes = require('./routes/users.routes');
const postsRoutes = require('./routes/posts.routes');
const prisma = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use('/users', usersRoutes);
app.use('/posts', postsRoutes);

// Start the server
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

module.exports = app;
module.exports.app = app;
module.exports.server = server;
module.exports.prisma = prisma;
