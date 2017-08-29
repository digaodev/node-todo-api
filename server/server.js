const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('./db/mongoose');
var Todo = require('./models/todo');
var User = require('./models/user');

var app = express();

app.use(bodyParser.json());

app.get('/todos', (req, res) => {
  Todo.find()
    .then((todos) => {
      res.status(200).send(todos);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.post('/todos', (req, res) => {
  let todo = new Todo({
    text: req.body.text
  });

  todo.save()
    .then((savedTodo) => {
      res.status(201).send(savedTodo);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.listen(3000, () => console.log('Listening on port 3000'));

module.exports = app;