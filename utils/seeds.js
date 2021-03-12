const mongoose = require('mongoose');
require('dotenv').config();
const Todo = require('../models/todo');
const logger = require('./logger');

const url = process.env.MONGODB_URI;
mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    logger.info('MONGO CONNECTION OPEN!');
  })
  .catch((err) => {
    logger.info('MONGO Error!!!');
    logger.error(err);
  });

const seedTodos = [
  {
    title: 'Go to the Store',
    status: false,
  },
  {
    title: 'Clean the bathroom',
    status: true,
  },
  {
    title: 'Wash the car',
    status: false,
  },
];

Todo.insertMany(seedTodos).then((res) => {
  logger.info(res);
});
