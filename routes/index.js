var express = require('express');
var router = express.Router();
const got = require('got');
const config = require('../configs/config');
const {
  getGitRepo
} = require('./api');
const {
  defaultLocals
} = require('../configs/common-setup');
const {
  getBlogs,
  getAllCategories
} = require('../controller/controller.blog');

let jwt = null;
let headersAuth = {
    responseType: 'json',
    headers: {
      Authorization:
        'Bearer ',
    }
};

/* GET home page. */
router.get('/', async function(req, res, next) {
  defaultLocals(req, res);
  let allRepo = null;
  try {
    allRepo = await getGitRepo(6, 1);
  } catch (error) {
    console.log(error);
  }
  res.render('partials/index', {allRepo});
});

router.get('/about', async function(req, res, next) {
  defaultLocals(req, res);
  let allRepo = null;
  let calcYear = new Date().getFullYear() - 2018;
  try {
    allRepo = await getGitRepo(6, 1);
  } catch (error) {
    console.log(error);
  }
  res.render('partials/about', {allRepo, calcYear});
});

router.get('/topics', async function(req, res, next) {
  defaultLocals(req, res);
  let allBlogs = [];
  let allCategories = [];
  let recentArticles = [];
  
  try {
    allBlogs = await getBlogs(3, '_featured=true');
    allCategories = await getAllCategories();
    recentArticles = await getBlogs(6, '_sort=createdAt:DESC');
  } catch (error) {
    console.log(error);
  }
  res.render('partials/topics', {allBlogs, allCategories, recentArticles});
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
