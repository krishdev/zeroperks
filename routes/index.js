var express = require('express');
var router = express.Router();
const got = require('got');
const config = require('../configs/config');
const {
  defaultLocals
} = require('../configs/common-setup');
let jwt = null;
let headersAuth = {
    responseType: 'json',
    headers: {
      Authorization:
        'Bearer ',
    }
};

/* GET home page. */
router.get('/', function(req, res, next) {
  defaultLocals(req, res);
  console.log('entering');
  res.render('partials/index');
});

router.get('/login', function (req, res) {
  res.locals.origin = process.env.NODE_ENV && process.env.NODE_ENV == 'production' ? 'https://zeroperks.com' : 'http://localhost:8080'
  res.locals.year = new Date().getFullYear();
  res.locals.token = null;
  res.locals.username = null;
  req.session.username = null;
  delete req.session.token;
  res.render('login', {
    title: 'login'
  });
})

router.post('/login', async function (req, res) {
  res.locals.origin = process.env.NODE_ENV && process.env.NODE_ENV == 'production' ? 'https://zeroperks.com' : 'http://localhost:8080'
  res.locals.year = new Date().getFullYear();
  res.locals.token = req.session.token || null;
  const body = req.body;
  try {
    const response = await got.post(config.acl+'/auth/local', {
      responseType: 'json',
      json: {
        identifier: body.email,
        password: body.password
      }
    });
    if (response && response.body) {
      console.log(response.body);
      req.session.token = response.body.jwt;
      req.session.username = response.body.user.username;
      req.session.userId = response.body.user.id;
      const redirecTo = req.session.redirect || '/';
      res.redirect(redirecTo);
    }
  } catch (error) {
    console.log('Login: ', error);
    res.render('login', {
      title: 'login',
      error: error
    });
  }
})

router.get('/register', function (req, res) {
  res.locals.origin = process.env.NODE_ENV && process.env.NODE_ENV == 'production' ? 'https://zeroperks.com' : 'http://localhost:8080'
  res.locals.year = new Date().getFullYear();
  res.locals.token = null;
  res.locals.username = null;
  req.session.username = null;
  delete req.session.token;
  req.session.redirect = req.headers.referer;
  res.render('register', {
    title: 'register'
  });
})

router.post('/register', async function (req, res) {
  res.locals.origin = process.env.NODE_ENV && process.env.NODE_ENV == 'production' ? 'https://zeroperks.com' : 'http://localhost:8080'
  res.locals.year = new Date().getFullYear();
  res.locals.token = req.session.token || null;
  const body = req.body;
  try {
    const response = await got.post(config.acl+'/auth/local/register', {
      responseType: 'json',
      json: {
        username: body.username,
        email: body.email,
        password: body.password
      }
    });
    if (response && response.body) {
      console.log(response.body);
      req.session.token = response.body.jwt;
      req.session.username = response.body.user.username;
      let redirecTo = req.session.redirect || '/';
      if (redirecTo) redirecTo = new URL(redirecTo).pathname;
      res.redirect(redirecTo);
    }
  } catch (error) {
    console.log('Register: ', error);
    res.render('register', {
      title: 'register',
      error: error
    });
  }
})

router.get('/logout', function (req, res) {
  req.session.token = null;
  req.session.username = null;
  let redirecTo = req.headers.referer || '/';
  if (redirecTo) redirecTo = new URL(redirecTo).pathname;
  console.log(redirecTo);
  res.redirect(redirecTo);
})

module.exports = router;
