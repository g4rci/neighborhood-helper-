require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bcrypt = require('bcrypt');
const multer = require ('multer');



const indexRouter = require('./routes/index');
const authRouter = require ('./routes/auth')
const privRouter = require('./routes/priv');

const app = express();

mongoose.connect(process.env.MONGODB_URI,  { useNewUrlParser: true }, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  })
  .then(x => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch(err => {
    console.error('Error connecting to mongo', err);
  });

  app.use(session({
    secret: 'hello',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 900000000000000 },
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl:  24 * 60 * 60 // 1 day
    })
  }));


  app.use(function(req, res, next) {
    app.locals.currentUser = req.session.currentUser;
    res.locals.currentUser = req.session.currentUser;
    next();
  }); 
  


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/auth', authRouter);

app.use('/', privRouter);





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// app.configure(()=>{
//   app.use((req,res,next) =>{
//     res.locals.user = req.session.user;
//     next(); 
//   })
// })


module.exports = app;
