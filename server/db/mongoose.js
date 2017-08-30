const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/TodoApp', {
    useMongoClient: true
  });
}

module.exports = mongoose;