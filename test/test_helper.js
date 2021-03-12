/* eslint-disable no-underscore-dangle */
const Todo = require('../models/todo');

const initialTodos = [
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

const nonExistingId = async () => {
  const todo = new Todo({
    title: 'willremovethissoon',
    status: false,
  });
  await todo.save();
  await todo.remove();

  return todo._id.toString();
};

const todosInDb = async () => {
  const todos = await Todo.find({});
  return todos.map((todo) => todo.toJSON());
};

module.exports = {
  initialTodos,
  nonExistingId,
  todosInDb,
};
