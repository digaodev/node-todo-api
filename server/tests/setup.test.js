const mongoose = require('mongoose');
const Todo = require('../models/todo');

before((done) => {
  mongoose.connect('mongodb://localhost/TodoApp_test', {
    useMongoClient: true
  });

  mongoose.connection
    .once('open', () => done())
    .on('error', (err) => {
      console.log(err);
    });
});

beforeEach((done) => {
  // const {
  //   todos
  // } = mongoose.connection.collections;

  Todo.remove()
    .then(() => {
      const todosSeed = [{
          text: 'A new todo 1'
        },
        {
          text: 'A new todo 2'
        },
        {
          text: 'A new todo 3'
        }
      ];

      Todo.insertMany(todosSeed)
        .then(() => done());

    })
    .catch((err) => done(err));
});