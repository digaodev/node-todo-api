const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const secret = 'a1b2c3';

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email',
      isAsync: false
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});

UserSchema.pre('save', function (next) {
  let userInstance = this;

  if (userInstance.isModified('password')) {
    bcrypt.genSalt((12, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    }));
  } else {
    next();
  }
});

UserSchema.statics.findByToken = function (token) {
  let UserModel = this;
  let decodedJWT;

  try {
    decodedJWT = jwt.verify(token, secret);
  } catch (err) {
    return Promise.reject();
  }

  return UserModel.findOne({
    '_id': decodedJWT._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};

UserSchema.methods.toJSON = function () {
  let userInstance = this;

  let userObject = userInstance.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function () {
  var userInstance = this;

  var access = 'auth';
  var token = jwt.sign({
    _id: userInstance._id.toHexString(),
    access
  }, secret).toString();

  userInstance.tokens.push({
    access,
    token
  });

  return userInstance.save()
    .then(() => {
      return token;
    });
};

const User = mongoose.model('User', UserSchema);

module.exports = User;