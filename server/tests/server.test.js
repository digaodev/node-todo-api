const expect = require('chai').expect;
const request = require('supertest');
const ObjectId = require('mongodb').ObjectID;

const app = require('../server');
const Todo = require('../models/todo');

const todosSeed = [{
    _id: new ObjectId(),
    text: 'A new todo 1'
  },
  {
    _id: new ObjectId(),
    text: 'A new todo 2'
  },
  {
    _id: new ObjectId(),
    text: 'A new todo 3'
  }
];

beforeEach((done) => {

  Todo.remove({}).then(() => {
      return Todo.insertMany(todosSeed);
    })
    .then(() => done())
    .catch((err) => done(err));;
});


describe('Express App', () => {

  describe('handles a GET /todos', () => {
    it('should retrieve all the todos', (done) => {
      request(app)
        .get('/todos')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
          expect(res.body).to.be.an('Object');
          expect(res.body.todos).to.be.an('Array');
          expect(res.body.todos.length).to.equal(3); // 3 from the seed data
        })
        .end((err) => {
          if (err) return done(err);
          done();
        });
    });
  });

  describe('handles a GET /todos/:id', () => {
    it('should retrieve one specific todo', (done) => {
      const id = todosSeed[0]._id.toHexString();

      request(app)
        .get(`/todos/${id}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
          expect(res.body).to.be.an('Object');
          expect(res.body.todo._id).to.equal(id);
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

});