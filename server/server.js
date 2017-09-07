require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const ObjectId = require('mongodb').ObjectID;

const mongoose = require('./db/mongoose');
const authenticate = require('./middleware/authenticate');
let Todo = require('./models/todo');
let User = require('./models/user');

let app = express();

app.use(bodyParser.json());

// todos routes
app.get('/todos', (req, res) => {
  Todo.find()
    .then((todos) => {
      res.status(200).send({
        todos
      });
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

        res.status(200).send({
          todo
        });
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

        res.status(200).send({
          todo
        });
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  } else {
    res.status(404).send();
  }
});

app.patch('/todos/:id', (req, res) => {
  const id = req.params.id;
  const body = _.pick(req.body, ['text', 'completed']);

  if (ObjectId.isValid(id)) {
    if (_.isBoolean(body.completed) && body.completed) {
      body.completedAt = new Date().getTime();
    } else {
      body.completed = false;
      body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {
        $set: body
      }, {
        new: true
      })
      .then((todo) => {
        if (!todo) return res.status(404).send();

        res.status(200).send({
          todo
        });
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  } else {
    res.status(404).send();
  }
});

// users routes
app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  let user = new User(body);

  user.save()
    .then(() => {
      return user.generateAuthToken();
    }).then((token) => {
      res.header('x-auth', token).status(201).send({
        user
      });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.get('/users/me', authenticate, (req, res) => {
  res.status(200).send(
    req.user
  );
});

app.post('/users/login', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password)
    .then((user) => {
      return user.generateAuthToken().then((token) => {
        res.header('x-auth', token).status(200).send({
          user
        });
      });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`));

module.exports = app;