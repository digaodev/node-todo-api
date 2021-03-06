const expect = require('chai').expect;
const request = require('supertest');
const ObjectId = require('mongodb').ObjectID;

const app = require('../server');
const Todo = require('../models/todo');
const User = require('../models/user');

const {
  todosSeed,
  populateTodos,
  usersSeed,
  populateUsers
} = require('./seed.test');


beforeEach(populateUsers);
beforeEach(populateTodos);

describe('Express App', () => {

  describe('handles a GET /todos', () => {
    it('should retrieve all the todos for a specific user', (done) => {
      request(app)
        .get('/todos')
        .set('x-auth', usersSeed[0].tokens[0].token)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.be.an('Object');
          expect(res.body.todos).to.be.an('Array');
          expect(res.body.todos.length).to.equal(2); // 2 from the seed data
        })
        .end((err) => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('handles a GET /todos/:id', () => {
    it('should retrieve one specific todo from a user', (done) => {
      const todoId = todosSeed[0]._id.toHexString();

      request(app)
        .get(`/todos/${todoId}`)
        .set('x-auth', usersSeed[0].tokens[0].token)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.be.an('Object');
          expect(res.body.todo._id).to.equal(todoId);
        })
        .end((err) => {
          if (err) return done(err);
          done();
        });
    });

    it('should NOT retrieve a specific todo another user', (done) => {
      const todoId = todosSeed[1]._id.toHexString();

      request(app)
        .get(`/todos/${todoId}`)
        .set('x-auth', usersSeed[0].tokens[0].token)
        .expect(404)
        .expect((res) => {
          expect(res.body).to.be.empty;
        })
        .end((err) => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('handles a POST /todos ', () => {
    it('should create a new todo', (done) => {
      var text = 'My new Todo test';

      request(app)
        .post('/todos')
        .set('x-auth', usersSeed[0].tokens[0].token)
        .send({
          text
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.text).to.equal(text);
        })
        .end((err, res) => {
          if (err) return done(err);

          Todo.find({
            text
          }).then((todos) => {
            expect(todos.length).to.equal(1);
            expect(todos[0].text).to.equal(text);
            done();
          }).catch((err) => done(err));
        });
    });

    it('should NOT create a new todo with an empty body data', (done) => {
      request(app)
        .post('/todos')
        .set('x-auth', usersSeed[0].tokens[0].token)
        .send({
          text: ''
        })
        .expect(400)
        .end((err, res) => {
          if (err) return done(err);

          Todo.find()
            .then((todos) => {
              expect(todos.length).to.equal(3); //3 from the seed data
              done();
            })
            .catch((err) => done(err));

        });
    });
  });

  describe('handles a DELETE /todos/:id', () => {
    it('should delete a specific todo and return it', (done) => {
      const todoId = todosSeed[0]._id;
      const todoIdStr = todosSeed[0]._id.toHexString();

      request(app)
        .delete(`/todos/${todoIdStr}`)
        .set('x-auth', usersSeed[0].tokens[0].token)
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.be.an('Object');
          expect(res.body.todo._id).to.equal(todoIdStr);
        })
        .end((err, res) => {
          if (err) return done(err);

          Todo.findById({
            _id: todoId
          }).then((todo) => {
            expect(todo).to.be.null;
            done();
          }).catch((err) => done(err));
        });
    });

    it('should NOT delete a specific todo from another user', (done) => {
      const todoId = todosSeed[1]._id;
      const todoIdStr = todosSeed[1]._id.toHexString();

      request(app)
        .delete(`/todos/${todoIdStr}`)
        .set('x-auth', usersSeed[0].tokens[0].token)
        .expect(404)
        .expect((res) => {
          expect(res.body).to.be.empty;
        })
        .end((err, res) => {
          if (err) return done(err);

          Todo.findById({
            _id: todoId
          }).then((todo) => {
            expect(todo).to.not.be.null;
            done();
          }).catch((err) => done(err));
        });
    });
  });

  describe('handles a PATCH /todos/:id', () => {
    it('should update a specific todo to completed=true and its text, and then return it', (done) => {
      const todoIdStr = todosSeed[0]._id.toHexString();
      const text = 'Updated todo text';

      request(app)
        .patch(`/todos/${todoIdStr}`)
        .set('x-auth', usersSeed[0].tokens[0].token)
        .send({
          text,
          completed: true
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.be.an('Object');
          expect(res.body.todo._id).to.equal(todoIdStr);
          expect(res.body.todo.text).to.be.equal(text);
          expect(res.body.todo.completed).to.be.true;
          expect(res.body.todo.completedAt).to.be.a('Number');
        })
        .end(done);
    });

    it('should update a specific todo to completed=false and return it', (done) => {
      const todoIdStr = todosSeed[2]._id.toHexString();

      request(app)
        .patch(`/todos/${todoIdStr}`)
        .set('x-auth', usersSeed[0].tokens[0].token)
        .send({
          completed: false
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .expect((res) => {
          expect(res.body).to.be.an('Object');
          expect(res.body.todo._id).to.equal(todoIdStr);
          expect(res.body.todo.completed).to.be.false;
          expect(res.body.todo.completedAt).to.be.null;
        })
        .end(done);
    });

    it('should NOT update a specific todo from another user', (done) => {
      const todoIdStr = todosSeed[1]._id.toHexString();

      request(app)
        .patch(`/todos/${todoIdStr}`)
        .set('x-auth', usersSeed[0].tokens[0].token)
        .send({
          completed: false
        })
        .expect(404)
        .expect((res) => {
          expect(res.body).to.be.empty;
        })
        .end(done);
    });
  });

  describe('handles a POST /users ', () => {
    it('should create a new user and return it as a response', (done) => {
      var email = 'testuser@test.com';
      var password = '12345678';

      request(app)
        .post('/users')
        .send({
          email,
          password
        })
        .expect(201)
        .expect((res) => {
          expect(res.headers['x-auth']).to.be.a('String');
          expect(res.body.user._id).to.be.a('String');
          expect(res.body.user.email).to.equal(email);
        })
        .end((err, res) => {
          if (err) return done(err);

          User.find({
            email
          }).then((users) => {
            expect(users.length).to.equal(1);
            expect(users[0].email).to.equal(email);
            expect(users[0].password).to.not.equal(password);
            done();
          }).catch((err) => done(err));
        });
    });

    it('should NOT create user and return status 400 and a validation error object due to wrong email and password', (done) => {
      request(app)
        .post('/users')
        .send({
          email: 'invalidemailATgmail.com',
          password: 'pass'
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.errors.password.message)
            .to.equal('Path `password` (`pass`) is shorter than the minimum allowed length (8).');
          expect(res.body.errors.email.message)
            .to.equal('invalidemailATgmail.com is not a valid email');
        })
        .end((err, res) => {
          if (err) return done(err);

          done();
        });
    });

    it('should NOT create user and return status 400 and a validation error code of 11000 due to existing email', (done) => {
      request(app)
        .post('/users')
        .send({
          email: usersSeed[0].email,
          password: usersSeed[0].password
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.code).to.equal(11000);
        })
        .end((err, res) => {
          if (err) return done(err);

          done();
        });
    });
  });

  describe('handles a GET /users/me', () => {
    it('should return user if authenticated', (done) => {
      request(app)
        .get('/users/me')
        .set('x-auth', usersSeed[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.body._id).to.equal(usersSeed[0]._id.toHexString());
          expect(res.body.email).to.equal(usersSeed[0].email);
        })
        .end(done);
    });

    it('should return status 401 and an empty response body if not authenticated', (done) => {
      request(app)
        .get('/users/me')
        .expect(401)
        .expect((res) => {
          expect(res.body).to.be.empty;
        })
        .end(done);
    });
  });

  describe('handles a POST /users/login', () => {
    it('should login user and return it with an auth token if login is succesful', (done) => {
      const email = usersSeed[1].email;
      const password = usersSeed[1].password;

      request(app)
        .post('/users/login')
        .send({
          email,
          password
        })
        .expect(200)
        .expect((res) => {
          expect(res.headers['x-auth']).to.be.a('String');
          expect(res.body.user._id).to.be.a('String');
          expect(res.body.user.email).to.equal(email);
        })
        .end((err, res) => {
          if (err) return done(err);

          User.find({
            email
          }).then((users) => {
            expect(users.length).to.equal(1);
            expect(users[0].tokens).to.be.an('Array');
            expect(users[0].tokens[0].access).to.equal('auth');
            expect(users[0].tokens[0].token).to.equal(res.headers['x-auth']);
            done();
          }).catch((err) => done(err));
        });
    });

    it('should NOT login user and reject with status 400 if login is unsuccesful', (done) => {
      const email = usersSeed[1].email;
      const password = 'invalidpass';

      request(app)
        .post('/users/login')
        .send({
          email,
          password
        })
        .expect(400)
        .expect((res) => {
          expect(res.headers['x-auth']).to.be.undefined;
        })
        .end((err, res) => {
          if (err) return done(err);

          User.find({
            email
          }).then((users) => {
            expect(users.length).to.equal(1);
            expect(users[0].tokens).to.be.an('Array');
            expect(users[0].tokens[0]).to.be.undefined;
            done();
          }).catch((err) => done(err));
        });
    });
  });

  describe('handles a DELETE /users/me/token', () => {
    it('should logout user and return an empty response and a 200 status if logout is succesful', (done) => {
      const email = usersSeed[0].email;

      request(app)
        .delete('/users/me/token')
        .set('x-auth', usersSeed[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
          expect(res.headers['x-auth']).to.be.undefined;
        })
        .end((err, res) => {
          if (err) return done(err);

          User.find({
            email
          }).then((users) => {
            expect(users.length).to.equal(1);
            expect(users[0].tokens).to.be.an('Array');
            expect(users[0].tokens).to.be.empty;
            done();
          }).catch((err) => done(err));
        });
    });

    it('should NOT login user and reject with status 400 if login is unsuccesful', (done) => {
      const email = usersSeed[1].email;
      const password = 'invalidpass';

      request(app)
        .post('/users/login')
        .send({
          email,
          password
        })
        .expect(400)
        .expect((res) => {
          expect(res.headers['x-auth']).to.be.undefined;
        })
        .end((err, res) => {
          if (err) return done(err);

          User.find({
            email
          }).then((users) => {
            expect(users.length).to.equal(1);
            expect(users[0].tokens).to.be.an('Array');
            expect(users[0].tokens[0]).to.be.undefined;
            done();
          }).catch((err) => done(err));
        });
    });
  });
});