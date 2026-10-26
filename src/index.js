require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const prisma = require('./config/db');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use(routes);

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
