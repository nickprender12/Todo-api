/* eslint-disable consistent-return */
const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.post('/', async (request, response) => {
  const { body } = request;
  if (body.password === undefined) {
    return response.status(400).json({
      error: 'Password is required',
    });
  }
  if (body.password.length < 3) {
    return response.status(400).json({
      error: 'Password is shorter than the minimum allowed length (3)',
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  });

  const savedUser = await user.save();

  response.json(savedUser);
});

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('todos', {
    name: 1,
    username: 1,
  });
  res.json(users);
});

module.exports = usersRouter;
