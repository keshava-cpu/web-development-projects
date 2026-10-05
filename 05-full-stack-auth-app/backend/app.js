import './config/env.js'
// const express = require("express");
import sequelize from './common/database.js';
import defineUser from './common/models/Users.js';
import express from 'express';
import authRoutes from './authorization/routes.js';
import userRoutes from './users/routes.js';
import cors from 'cors';

console.log(process.env.JWT_SECRET);

const app = express();

const user = defineUser(sequelize);
await sequelize.sync();

app.use(cors());
app.use(express.json());
app.use('/', authRoutes);
app.use('/user', userRoutes);

app.get("/status", (req, res) => {
  res.json({
    status: "Running",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Listening to port ${PORT}`));
