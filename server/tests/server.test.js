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
    text: 'A new todo 2',
    completed: true,
    completedAt: 111
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

  describe('handles a DELETE /todos/:id', () => {
    it('should delete one specific todo and return it', (done) => {
      const id = todosSeed[0]._id;
      const idStr = todosSeed[0]._id.toHexString();

      request(app)
        .delete(`/todos/${idStr}`)
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
          expect(res.body).to.be.an('Object');
          expect(res.body.todo._id).to.equal(idStr);
        })
        .end((err, res) => {
          if (err) return done(err);

          Todo.findById({
            _id: id
          }).then((todo) => {
            expect(todo).to.be.null;
            done();
          }).catch((err) => done(err));
        });
    });
  });

  describe('handles a PATCH /todos/:id', () => {
    it('should update one specific todo to completed=true and its text, and then return it', (done) => {
      const id = todosSeed[0]._id;
      const idStr = todosSeed[0]._id.toHexString();
      const text = 'Updated todo text';

      request(app)
        .patch(`/todos/${idStr}`)
        .send({
          text,
          completed: true
        })
        .expect('Content-Type', /json/)
        .expect(200)
        .expect((res) => {
          expect(res.body).to.be.an('Object');
          expect(res.body.todo._id).to.equal(idStr);
          expect(res.body.todo.text).to.be.equal(text);
          expect(res.body.todo.completed).to.be.true;
          expect(res.body.todo.completedAt).to.be.a('Number');
        })
        .end(done);
    });
  });

  it('should update one specific todo to completed=false and return it', (done) => {
    const id = todosSeed[1]._id;
    const idStr = todosSeed[1]._id.toHexString();

    request(app)
      .patch(`/todos/${idStr}`)
      .send({
        completed: false
      })
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body).to.be.an('Object');
        expect(res.body.todo._id).to.equal(idStr);
        expect(res.body.todo.completed).to.be.false;
        expect(res.body.todo.completedAt).to.be.null;
      })
      .end(done);
  });


});