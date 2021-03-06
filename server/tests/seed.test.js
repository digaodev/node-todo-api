const ObjectId = require('mongodb').ObjectID;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const Todo = require('../models/todo');
const User = require('../models/user');

const firstUserID = new ObjectId();
const secondUserID = new ObjectId();

const usersSeed = [{
    _id: firstUserID,
    email: 'loggedinseeduser0@test.com',
    password: '00000000',
    tokens: [{
      access: 'auth',
      token: jwt.sign({
        _id: firstUserID,
        access: 'auth'
      }, process.env.JWT_SECRET).toString()
    }]
  },
  {
    _id: secondUserID,
    email: 'loggedoutseeduser1@test.com',
    password: '11111111'
  }
];

const todosSeed = [{
    _id: new ObjectId(),
    text: 'A new todo 1',
    _author: firstUserID
  },
  {
    _id: new ObjectId(),
    text: 'A new todo 2',
    completed: true,
    completedAt: 111,
    _author: secondUserID
  },
  {
    _id: new ObjectId(),
    text: 'A new todo 3',
    completed: true,
    completedAt: 222,
    _author: firstUserID
  }
];

// const populateUsers = (done) => {
//   User.remove({}).then(() => {
//       return User.insertMany(usersSeed);
//     })
//     .then(() => done())
//     .catch((err) => done(err));
// };
const populateUsers = (done) => {
  User.remove({}).then(() => {
      return Promise.all([
        new User(usersSeed[0]).save(),
        new User(usersSeed[1]).save()
      ]);
    })
    .then(() => done())
    .catch((err) => done(err));
};

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
      return Todo.insertMany(todosSeed);
    })
    .then(() => done())
    .catch((err) => done(err));
};

module.exports = {
  todosSeed,
  populateTodos,
  usersSeed,
  populateUsers
};