// const mongoose = require('mongoose');
// const Todo = require('../models/todo');

// // before((done) => {
//   // mongoose.connect('mongodb://localhost/TodoApp_test', {
//   //   useMongoClient: true
//   // });

//   // mongoose.connection
//   //   .once('open', () => done())
//   //   .on('error', (err) => {
//   //     console.log(err);
//   //   });
//   const todosSeed = [{
//     _id: new ObjectId(),
//     text: 'A new todo 1'
//   },
//   {
//     _id: new ObjectId(),
//     text: 'A new todo 2',
//     completed: true,
//     completedAt: 111
//   },
//   {
//     _id: new ObjectId(),
//     text: 'A new todo 3'
//   }
// ];

//   beforeEach((done) => {
    
//       Todo.remove({}).then(() => {
//           return Todo.insertMany(todosSeed);
//         })
//         .then(() => done())
//         .catch((err) => done(err));;
//     });
    
// // });