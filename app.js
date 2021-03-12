const express = require('express');
require('express-async-errors');

const app = express();
const mongoose = require('mongoose');
const cors = require('cors')
const config = require('./utils/config');
const todosRouter = require('./controllers/todos');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const middleware = require('./utils/middleware');
const logger = require('./utils/logger');
const dotenv = require("dotenv");

dotenv.config();
const MONGODB_URI = "mongodb+srv://todo-admin:hRP3N910lgfTXVpN@cluster0.5v9ve.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

// logger.info('connecting to', config.MONGODB_URI);
logger.info('connecting to', MONGODB_URI);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB', error.message);
  });

app.use(cors());
app.use(express.static('build'));
app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

app.use('/api/todos', todosRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);

app.use(middleware.responseLogged);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
