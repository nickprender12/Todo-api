const mongoose = require('mongoose');
const supertest = require('supertest');
const helper = require('./test_helper');
const app = require('../app');

const api = supertest(app);
const Todo = require('../models/todo');

beforeAll((done) => {
  if (!mongoose.connection.db) {
    mongoose.connection.on('connected', done);
  } else {
    done();
  }
}, 20000);

beforeEach(async () => {
  await Todo.deleteMany({});

  const todoObject = helper.initialTodos.map((todo) => new Todo(todo));
  const promiseArray = todoObject.map((todo) => todo.save());
  await Promise.all(promiseArray);
});

describe('when there are initially some todos in DB', () => {
  test('todos are returned as json with correct status code', async () => {
    await api
      .get('/api/todos')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('all todos are returned', async () => {
    const response = await api.get('/api/todos');

    expect(response.body).toHaveLength(helper.initialTodos.length);
  });

  test('a specific todo is within the returned todos', async () => {
    const response = await api.get('/api/todos');
    const todos = response.body.map((res) => res.title);
    expect(todos).toContain('Go to the Store');
  });
});

describe('viewing a specific todo', () => {
  test('succeeds with a valid id', async () => {
    const todosAtStart = await helper.todosInDb();
    const todoToView = todosAtStart[0];

    const resultTodo = await api
      .get(`/api/todos/${todoToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const processedTodoToView = JSON.parse(JSON.stringify(todoToView));

    expect(resultTodo.body).toEqual(processedTodoToView);
  });
  test('fails with statuscode 404 if todo does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId();

    await api.get(`/api/todos/${validNonexistingId}`).expect(404);
  });

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5fcea4dc4b7c6a4610ee526b5';

    await api.get(`/api/todos/${invalidId}`).expect(400);
  });
});

describe('addition of a new todo', () => {
  test('succeeds with a a valid data', async () => {
    const newTodo = {
      title: 'finish this app',
      status: false,
    };
    await api
      .post('/api/todos')
      .send(newTodo)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const todosAtEnd = await helper.todosInDb();
    expect(todosAtEnd).toHaveLength(helper.initialTodos.length + 1);
  });

  test('without the status param defaults to false', async () => {
    const newTodo = {
      title: 'todo without status',
    };
    await api
      .post('/api/todos')
      .send(newTodo)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const todosAtEnd = await helper.todosInDb();
    const todos = todosAtEnd.map((r) => r.status);
    expect(todosAtEnd[todos.length - 1].status).toBeFalsy();
  });
  test('fails with status code 400 if data invalid', async () => {
    const newTodo = {
      status: false,
    };

    await api.post('/api/todos').send(newTodo).expect(400);

    const todosAtEnd = await helper.todosInDb();

    expect(todosAtEnd).toHaveLength(helper.initialTodos.length);
  });
});

describe('updating an existing todo', () => {
  test('succeeds with valid status code and returns updated object', async () => {
    const todosAtStart = await helper.todosInDb();
    const todoToView = todosAtStart[0];

    const todo = {
      title: todosAtStart[0].title,
      status: !todosAtStart[0].status,
    };

    await api
      .put(`/api/todos/${todoToView.id}`)
      .send(todo)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const todosAtEnd = await helper.todosInDb();
    expect(todosAtEnd[0].status).toBeTruthy();
  });
});

describe('deletion of a todo', () => {
  test('succeeds with a status code 204 if id is valid and content is removed', async () => {
    const todosAtStart = await helper.todosInDb();
    const todoToDelete = todosAtStart[0];

    await api.delete(`/api/todos/${todoToDelete.id}`).expect(204);

    const todosAtEnd = await helper.todosInDb();
    expect(todosAtEnd).toHaveLength(helper.initialTodos.length - 1);
  });
});

afterAll((done) => {
  mongoose.connection.close();
  done();
});
