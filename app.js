var createError = require('http-errors');
var express = require('express');
const session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
const helmet = require('helmet');
const logger = require('./configs/logger');
const cors = require('cors');
require('dotenv').config();



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postRouter = require('./routes/post');
var eventRouter = require('./routes/event');
var categoryRouter = require('./routes/category');
var apiRouter = require('./routes/api');
var {
  schedulerOnceAWeek
} = require('./controller/controller.scheduler');
const {
  defaultLocals
} = require('./configs/common-setup');
const config = require('./configs/config');

var app = express();
var expressLayouts = require('express-ejs-layouts');

mongoose.connect(`mongodb://${config.mongo.username}:${config.mongo.password}@localhost:27017/${config.mongo.dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressLayouts);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet({
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const isDev = process.env.NODE_ENV === 'development';
logger.error(`Environment: ${isDev ? 'Development' : 'Production'}`);
if (isDev) {
  app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:1337'],
    credentials: true
  }));

  app.use(helmet.contentSecurityPolicy({
    reportOnly: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://accounts.google.com",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "http://localhost:3000",
        "http://localhost:1337",
        "https://cdn.jsdelivr.net"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://accounts.google.com", // <- added this for One Tap style
        "http://localhost:3000",
        "http://localhost:1337"
      ],
      fontSrc: [
        "'self'",
        "data:",
        "https://fonts.gstatic.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "http://localhost:1337",
        "https://www.google.com",
        "https://www.gstatic.com"
      ],
      connectSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://www.google-analytics.com", // <- added this for GA tracking
        "http://localhost:3000",
        "http://localhost:1337"
      ],
      frameSrc: [
        "'self'",
        "https://accounts.google.com"
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    }
  }));

} else {
  app.use(cors({
    origin: ['https://www.zeroperks.com', 'https://admin.zeroperks.com'],
    credentials: true
  }));
  app.use(helmet.contentSecurityPolicy({
    reportOnly: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://accounts.google.com",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://www.zeroperks.com",
        "https://zeroperks.com",
        "https://admin.zeroperks.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://accounts.google.com", // <- added this for One Tap style
        "https://www.zeroperks.com",
        "https://zeroperks.com",
        "https://admin.zeroperks.com"
      ],
      fontSrc: [
        "'self'",
        "data:",
        "https://fonts.gstatic.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://www.zeroperks.com",
        "https://zeroperks.com",
        "https://admin.zeroperks.com",
        "https://www.google.com",
        "https://www.gstatic.com"
      ],
      connectSrc: [
        "'self'",
        "https://accounts.google.com",
        "https://www.google-analytics.com", // <- added this for GA tracking
        "https://www.zeroperks.com",
        "https://zeroperks.com",
        "https://admin.zeroperks.com"
      ],
      frameSrc: [
        "'self'",
        "https://accounts.google.com"
      ],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    }
  }));
}

app.use(helmet.referrerPolicy({ policy: 'no-referrer-when-downgrade' }));

var { v4: uuidv4 } = require('uuid');

app.use(session({ 
  name:'SessionCookie',
  genid: function(req) {
    console.log('session id created');
    return uuidv4();}, 
  secret: 'satham!Pod@th$!',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false,expires:7 * 24 * 60 * 60 * 1000 }
}));

app.set('layout', 'main-layout');
// app.set("layout extractScripts", true);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/category', categoryRouter);
app.use('/post', postRouter);
app.use('/event', eventRouter);
app.use('/api', apiRouter);
schedulerOnceAWeek();
// catch 404 and forward to error handler
app.use((req, res, next) => {
  if (req.method === 'GET') {
    defaultLocals(req, res);
  }
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  defaultLocals(req, res);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
