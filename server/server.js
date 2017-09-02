const express = require('express');
const bodyParser = require('body-parser');

const mongoose = require('./db/mongoose');
const ObjectId = require('mongodb').ObjectID;
var Todo = require('./models/todo');
var User = require('./models/user');

var app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/todos', (req, res) => {
  Todo.find()
    .then((todos) => {
      res.status(200).send({ todos });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.get('/todos/:id', (req, res) => {
  const id = req.params.id;

  if (ObjectId.isValid(id)) {
    Todo.findById(id)
      .then((todo) => {
        if (!todo) return res.status(404).send();

        res.status(200).send({ todo });
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  } else {
    res.status(404).send();
  }
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

app.delete('/todos/:id', (req, res) => {
    const id = req.params.id;
  
    if (ObjectId.isValid(id)) {
      Todo.findByIdAndRemove(id)
        .then((todo) => {
          if (!todo) return res.status(404).send();
  
          res.status(200).send({ todo });
        })
        .catch((err) => {
          res.status(400).send(err);
        });
    } else {
      res.status(404).send();
    }
  });

app.listen(port, () => console.log(`Listening on port ${port}`));

module.exports = app;