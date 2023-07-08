var express = require('express');
var router = express.Router();
const got = require('got');
var svgCaptcha = require('svg-captcha');
const config = require('../configs/config');
const admin = require('firebase-admin/app');

const serviceKey = require('../configs/service-key.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceKey),
    databaseURL: 'https://arrangetram-fc6b6-default-rtdb.firebaseio.com'
});

const {
  sendEmail
  } = require('../controller/controller.email');

const {
  defaultLocals,
  getGitRepo
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
    sendEmail({
        from: 'mailkrishna2@gmail.com',
        to: 'mailkrishna2@gmail.com',
        subj: 'Zeroperks | Error occurred on GitRepo fetch',
        content: `<p>${new Date().toString()}</p> ${error}`
    })
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

router.get('/contact', async function(req, res, next) {
  defaultLocals(req, res);
  res.render('partials/contact');
});

router.get('/dance', async function(req, res, next) {
  defaultLocals(req, res);
  res.render('partials/dance');
});

router.post('/arrangetram-540', async function (req, res) {
  var db = admin.database();
  var userRef = db.ref("participants");

  const data = req.body;
  const name = data.name;
  const email = data.email;
  const phone = data.phone;
  const guests = data.guests;
  const timestamp = new Date().toLocaleString();

  // Save the data to Firebase.
  try {
    const db = await firebase.database();
    db.ref("participants").push({
      name,
      email,
      phone,
      guests,
      timestamp,
    });
  
    res.send("Data saved");
  } catch (error) {
    res.status(500).send({
      message: error
    })
  }
});


router.get('/login', async function (req, res) {
  res.locals.origin = config.env;
  res.locals.year = new Date().getFullYear();
  res.locals.aclPort = config.acl;
  res.locals.token = null;
  res.locals.username = null;
  req.session.username = null;
  delete req.session.token;
  let allCategories = [];
  try {
    allCategories = await getAllCategories();
  } catch (error) {
    console.log(error);
  }
  res.render('partials/login', {allCategories});
})

router.post('/login', async function (req, res) {
  res.locals.origin = config.env;
  res.locals.year = new Date().getFullYear();
  res.locals.token = req.session.token || null;
  res.locals.aclPort = config.acl;
  let allCategories = [];
  try {
    allCategories = await getAllCategories();
  } catch (error) {
    console.log(error);
  }
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
      console.log('redirectTo: ' + redirecTo);
      res.redirect(redirecTo);
    }
  } catch (error) {
    console.log('Login: ', error);
    res.render('partials/login', {
      title: 'login',
      error: error,
      allCategories
    });
  }
})

router.get('/register', async function (req, res) {
  res.locals.origin = config.env;
  res.locals.year = new Date().getFullYear();
  res.locals.token = null;
  res.locals.username = null;
  req.session.username = null;
  res.locals.aclPort = config.acl;
  delete req.session.token;
  req.session.redirect = req.headers.referer;
  let allCategories = [];
  try {
    allCategories = await getAllCategories();
  } catch (error) {
    console.log(error);
  }
  res.render('partials/register', {
    allCategories
  });
})

router.post('/register', async function (req, res) {
  res.locals.origin = config.env;
  res.locals.year = new Date().getFullYear();
  res.locals.token = req.session.token || null;
  res.locals.aclPort = config.acl;
  const body = req.body;
  let allCategories = [];
  try {
    allCategories = await getAllCategories();
  } catch (error) {
    console.log(error);
  }
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
    res.render('partials/register', {
      title: 'register',
      error: error,
      allCategories
    });
  }
})

router.get('/logout', function (req, res) {
  delete req.session.token;
  delete req.session.username;
  let redirecTo = req.headers.referer || '/';
  if (redirecTo) redirecTo = new URL(redirecTo).pathname;
  console.log(redirecTo);
  res.redirect(redirecTo);
})

router.get('/verify-image', function (req, res) {
  var captcha = svgCaptcha.create();
  req.session.captcha = captcha.text;
  
  res.type('svg');
  res.status(200).send(captcha.data);
})

let timer = null;
function setTimer () {
  clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    sendEmail({
      from: 'mailkrishna2@gmail.com',
      to: 'mailkrishna2@gmail.com',
      subj: 'Zeroperks Scheduler - Timer errored',
      content: `Zeroperks Scheduler - Home network not detected Time: ${new Date().toString()}`,
      cc: 'emailtorsounder@gmail.com'
    })
  }, 10000);
}

router.get('/api/regular-interval/', function (req, res) {
  if (timer === null) {
    sendEmail({
      from: 'mailkrishna2@gmail.com',
      to: 'mailkrishna2@gmail.com',
      subj: 'Zeroperks Scheduler - Timer activated',
      content: `Zeroperks Scheduler - Home network activated and listening since: ${new Date().toString()}`,
      cc: 'emailtorsounder@gmail.com'
    })
  }
  clearTimeout(timer);
  setTimer();
  res.status(200).json({
    success: true
  })
})
module.exports = router;
