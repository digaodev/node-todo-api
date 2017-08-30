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