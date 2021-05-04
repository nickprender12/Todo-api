/* eslint-disable no-underscore-dangle */
const todosRouter = require('express').Router();
const jwt = require('jsonwebtoken');
//  const { response } = require('express');
const Todo = require('../models/todo');
const User = require('../models/user');

todosRouter.get('/', async (req, res) => {
  const todos = await Todo.find({}).populate('user', {
    _id: 1,
    username: 1,
    name: 1,
  });
  if (todos) {
    res.json(todos);
  } else {
    res.status(404).end();
  }
});

todosRouter.get('/:id', async (request, response) => {
  const todo = await Todo.findById(request.params.id);

  if (todo) {
    response.json(todo);
  } else {
    response.status(404).end();
  }
});

// eslint-disable-next-line consistent-return
todosRouter.post('/', async (request, response) => {
  const { body } = request;
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' });
  }
  const user = await User.findById(decodedToken.id);

  const todo = new Todo({
    title: body.title,
    status: body.status,
    user: user.id,
  });
  const savedTodo = await todo.save();

  user.todos = user.todos.concat(savedTodo._id);
  await user.save();

  response.json(savedTodo);
});

todosRouter.put('/:id', async (request, response) => {
  const { body } = request;

  const todo = {
    title: body.title,
    status: body.status,
  };

  const updatedTodo = await Todo.findByIdAndUpdate(request.params.id, todo, {
    new: true,
  });
  response.json(updatedTodo);
});

todosRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const todoToDelete = await Todo.findByIdAndDelete(id);

  response.status(204).json(todoToDelete).end();
});
module.exports = todosRouter;
