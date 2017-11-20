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
      // required: true
    },
    token: {
      type: String,
      // required: true
    }
  }]
});

UserSchema.pre('save', function (next) {
  let userInstance = this;

  if (userInstance.isModified('password')) {
    bcrypt.genSalt((12, (err, salt) => {
      bcrypt.hash(userInstance.password, salt, (err, hash) => {
        userInstance.password = hash;
        next();
      });
    }));
  } else {
    next();
  }
});

// the es5 function notation is needed here
// because arrow functions do not bind the 'this' keyword
// and in this function the User instance is needed
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

UserSchema.methods.removeToken = function (token) {
  let userInstance = this;

  return userInstance.update({
    $pull: {
      tokens: {
        token
      }
    }
  });
};

// overriding this is necessary to limit the information returned by default
// for security reasons, the token and password should not be returned
UserSchema.methods.toJSON = function () {
  let userInstance = this;

  let userObject = userInstance.toObject();

  return _.pick(userObject, ['_id', 'email']);
};

// the es5 function notation is needed here
// because arrow functions do not bind the 'this' keyword
// and in this function the User Model is needed
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
    'tokens.access': 'auth',
    'tokens.token': token
  });
};

UserSchema.statics.findByCredentials = function (email, password) {
  let UserModel = this;

  return UserModel.findOne({
      email,
    })
    .then((user) => {
      if (!user) return Promise.reject();

      return bcrypt.compare(password, user.password)
        .then((validpass) => {
          if (validpass) {
            return Promise.resolve(user);
          } else {
            return Promise.reject();
          }
        });
    });

};

const User = mongoose.model('User', UserSchema);

module.exports = User;