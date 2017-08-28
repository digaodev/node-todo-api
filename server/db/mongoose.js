const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect('mongodb://localhost/TodoApp', {
    useMongoClient: true
  });
}

module.exports = {
  mongoose
};