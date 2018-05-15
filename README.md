# Note ToDo API

* Backend API for a todo app in Node with Express, MongoDB and JWT-based token authentication via middleware. Tests are using Chai, Mocha and Supertest.

## How to run

To get started:

* make sure MongoDB is installed and running.

* install all project dependencies with `npm install`

  Notable dependencies:
```js
    "bcryptjs": "^2.4.3",
    
    "body-parser": "^1.18.3",
    
    "express": "^4.16.3",
    
    "jsonwebtoken": "^7.4.3",
    
    "lodash": "^4.17.10",
    
    "mongodb": "^2.2.35",
    
    "mongoose": "5.1.1",
    
    "validator": "^8.2.0"
```

## How to use it

* To use the app simply run it from the command line:
```
> npm start
```

* To run the tests simply run from the command line. You should see all the tests passing:
```
> npm test
```
![Screen Shot for test command](https://github.com/digaodev/node-todo-api/blob/docs/docs/Screen_tests.png?raw=true)
