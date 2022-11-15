const { errorMonitor } = require('events');
const express = require('express');
const path = require('path');
const dogRouter = require('./routes/dogs');

require('express-async-errors');

const app = express();

app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'assets')));

const logMethodAndUrl = (req, res, next) => {
  console.log(req.method, req.url);
  res.on('finish', () => {
    console.log(res.statusCode);
  });
  next();
}

app.use(logMethodAndUrl); //this middleware is behind static middleware, so no static asset route

// For Dog Router
app.use('/dogs', dogRouter);

// For testing purposes, GET /
app.get('/', (req, res) => {
  res.json("Express server running. No content provided at root level. Please use another route.");
});

// For testing express.json middleware
app.post('/test-json', (req, res, next) => {
  // send the body as JSON with a Content-Type header of "application/json"
  // finishes the response, res.end()
  res.json(req.body);
  next();
});

// For testing express-async-errors
app.get('/test-error', async (req, res) => {
  throw new Error("Hello World!")
});

// app.use((err, req, res, next) => {
//   // console.log(err);
//   // res.statusCode = err.statusCode || 500;
//   // res.send(`Error: ${err.message}`);
//   next(err);
// });

const errFunc = (req, res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.statusCode = 404;
  throw err;
}

app.use(errFunc);

app.use((err, req, res, next) => {
  const isProduction = "production" === process.env.NODE_ENV;
  console.log(err);
  res.statusCode = err.statusCode || 500;
  res.json({
    message: "Something went wrong",
    statusCode: res.statusCode,
    stack: isProduction ? null : err.stack,
  });
});

// console.log(process.env.NODE_ENV);

const port = 5000;
app.listen(port, () => console.log('Server is listening on port', port));
