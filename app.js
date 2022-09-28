var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo');
var cors = require('cors');

require('dotenv').config();


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var auth = require('./middlewares/auth')


//connecting to Database
mongoose.connect( process.env.MONGO_CONNECTION_STRING ,(err)=>{
  console.log( err ? err : 'Connection to DB established');
})

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

//add sessions
app.use(session({
  secret: process.env.SECRET, //this secret is used to hash the session so that any confidential info is not leaked.
  resave: false, //this will forecefully save the session everytime we open the link, causing the expiry date to keep on extendind. This is helpful when situation is like when user is inactive for x time duration then log him out.
  saveUninitialized: false, //this is to ensure that the blank sessions are not created the first time we login. Sessions will be saved only when there's a update in the sessions to make sure sessions has userId.
  store: MongoStore.create({ mongoUrl: process.env.MONGO_CONNECTION_STRING })
}))

// by using this middleware before going to any route, we are adding the user object containing user details for the logged in user.
app.use(auth.userInfo); //all the routes after this will have access to the user details

app.use('/', indexRouter);
app.use('/users', usersRouter);

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

module.exports = app;
