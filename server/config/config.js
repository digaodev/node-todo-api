var config = require('./config.json');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (process.env.NODE_ENV === 'development') {
  process.env.PORT = config.development.PORT;
  process.env.MONGODB_URI = config.development.MONGODB_URI;
  process.env.JWT_SECRET = config.development.JWT_SECRET;
} else if (process.env.NODE_ENV === 'test') {
  process.env.PORT = config.test.PORT;
  process.env.MONGODB_URI = config.test.MONGODB_URI;
  process.env.JWT_SECRET = config.test.JWT_SECRET;
}