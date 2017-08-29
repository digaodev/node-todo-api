const expect = require('chai').expect;
const request = require('supertest');

const app = require('../server');
const Todo = require('../models/todo');

describe('Express App', () => {

  describe('handles a GET /todos', () => {
    it('should retrieve all the todos', (done) => {
      request(app)
        .get('/todos')
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
          expect(res.body).to.be.an('Array');
          expect(res.body.length).to.equal(3);  //3 from the seed data
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

          Todo.find({text}).then((todos) => {
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