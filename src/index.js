// Prisma
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');


const connectionString = process.env.DATABASE_URL || "postgresql://ram@localhost:5432/db2"; // adjust if your URL is different
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);


const prisma = new PrismaClient({ adapter });
// Express
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

