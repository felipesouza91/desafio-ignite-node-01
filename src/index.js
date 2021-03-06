const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const existsUser = users.find( item => item.username === username);
  if (!existsUser ) {
    return response.status(400).json({error: "A username not exists!"});
  }
  request.user = existsUser;
  next();
}

app.post('/users', (request, response) => {
  const { name , username } = request.body;
  const user =  { id: uuidv4(), name, username, todos:[] }
  const existsUser = users.find( item => item.username === username);
  if (existsUser ) {
    return response.status(400).json({error: "A username alread exists!"});
  }
  users.push(user);
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const todo = { 
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    created_at: new Date(),
    done: false
  };
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  const todoIndex = user.todos.findIndex( item => item.id === id);
  if (todoIndex === -1) {
    return response.status(404).json({error: "ToDo not exists!"})
  }
  user.todos[todoIndex].title = title;
  user.todos[todoIndex].deadline = new Date(deadline);
  return response.status(200).json(user.todos[todoIndex]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  const todoIndex = user.todos.findIndex( item => item.id === id);
  if (todoIndex === -1) {
    return response.status(404).json({error: "ToDo not exists!"})
  }
  user.todos[todoIndex].done = true
  return response.status(200).json(user.todos[todoIndex]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  const todoIndex = user.todos.findIndex( item => item.id === id);
  if (todoIndex === -1) {
    return response.status(404).json({error: "ToDo not exists!"})
  }
  user.todos.splice(todoIndex, 1);
  return response.status(204).json();
});

module.exports = app;