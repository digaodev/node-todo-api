const mongoose = require('mongoose');

before((done) => {
  mongoose.connect('mongodb://localhost/TodoApp_test', { useMongoClient: true });

  mongoose.connection
  .once('open', () => done())
  .on('error', (err) => {
    console.log(err);
  });
});

beforeEach((done) => {
const { todos } = mongoose.connection.collections;

todos.drop()
.then(() => done())
.catch(() => done());

});