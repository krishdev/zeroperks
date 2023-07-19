var express = require('express');
var router = express.Router();
const got = require('got');
var svgCaptcha = require('svg-captcha');
const config = require('../configs/config');
const admin = require('firebase-admin');
const fs = require('fs');

var readHTMLFile = function(path, callback) {
  fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
      if (err) {
         callback(err);                 
      }
      else {
          callback(null, html);
      }
  });
};

const serviceKey = require('../configs/service-key.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceKey),
    databaseURL: 'https://dance-e6a81.firebaseio.com'
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
  const db = admin.firestore();
  const docRef = db.collection('participants').doc();

  const data = req.body;
  const name = data.name;
  const email = data.email;
  const phone = data.phone;
  const guests = data.guests;
  const timestamp = new Date().toLocaleString();

  // Save the data to Firebase.
  try {
    //const db = await admin.firestore().collection("users").add(data);
    const response = await docRef.set(data);
    res.json({message: "Data saved", other: response});

    
    sendEmail({
        from: 'thaarikashanmugam@gmail.com',
        to: email,
        subj: 'Thaarika\'s Bharatanatyam Arangetram',
        content: `<!doctypehtml><html xmlns=http://www.w3.org/1999/xhtml xmlns:o=urn:schemas-microsoft-com:office:office xmlns:v=urn:schemas-microsoft-com:vml><head><!--[if gte mso 9]><xml><o:officedocumentsettings><o:allowpng><o:pixelsperinch>96</o:pixelsperinch></o:officedocumentsettings></xml><![endif]--><meta content="text/html; charset=UTF-8"http-equiv=Content-Type><meta content="width=device-width,initial-scale=1"name=viewport><meta name=x-apple-disable-message-reformatting><!--[if !mso]><!--><meta content="IE=edge"http-equiv=X-UA-Compatible><!--<![endif]--><title>Newsletter</title><style>a,a:hover,a:link,a:visited,a[href]{text-decoration:none!important;color:#00e}.link{text-decoration:underline!important}p,p:visited{font-size:15px;line-height:24px;font-family:Helvetica,Arial,sans-serif;font-weight:300;text-decoration:none;color:#000}h1{font-size:22px;line-height:24px;font-family:Helvetica,Arial,sans-serif;font-weight:400;text-decoration:none;color:#000}.ExternalClass font,.ExternalClass p,.ExternalClass span,.ExternalClass td{line-height:100%}.ExternalClass{width:100%}</style><body align=center style=text-align:center;margin:0;padding-top:10px;padding-bottom:10px;padding-left:0;padding-right:0;-webkit-text-size-adjust:100%;background-color:#f2f4f6;color:#000><div style=text-align:center><table align=center style=text-align:center;vertical-align:top;width:600px;max-width:600px;background-color:#fff width=600><tr><td style=width:596px;vertical-align:top;padding-left:0;padding-right:0;padding-top:15px;padding-bottom:15px width=596><h1>Thaarika's Bharatanatyam Arangetram</h1></table><img align=center alt="Hero image"height=350 src=https://zeroperks.com/assets/gallery/t-7.jpg style=width:600px;max-width:600px;height:350px;max-height:350px;text-align:center width=600><table align=center style=text-align:center;vertical-align:top;width:600px;max-width:600px;background-color:#fff width=600><tr><td style=width:596px;vertical-align:top;padding-left:30px;padding-right:30px;padding-top:30px;padding-bottom:40px width=596><h1 style=font-size:20px;line-height:24px;font-family:Helvetica,Arial,sans-serif;font-weight:600;text-decoration:none;color:#000>Invitation</h1><p style=font-size:15px;line-height:24px;font-family:Helvetica,Arial,sans-serif;font-weight:400;text-decoration:none;color:#919293>Mr Shanmugam and Mrs Nethra along with Natyom Dance Academy cordially invite you to their daughter Thaarika's Bharatanatyam Arangetram Disciple of Smt. Praveena Vajja.</p><a href=https://zeroperks.com/dance style="background-color:#000;font-size:15px;line-height:22px;font-family:Helvetica,Arial,sans-serif;font-weight:400;text-decoration:none;padding:12px 15px;color:#fff;border-radius:5px;display:inline-block;mso-padding-alt:0"target=_blank><!--[if mso]><i style=letter-spacing:25px;mso-font-width:-100%;mso-text-raise:30pt> </i><![endif]--> <span style=mso-text-raise:15pt;color:#fff>Learn More</span><!--[if mso]><i style=letter-spacing:25px;mso-font-width:-100%> </i><![endif]--></a></table><img align=center alt=Image height=240 src=https://zeroperks.com/assets/gallery/t-1.jpg style=width:600px;max-width:600px;height:350px;max-height:350px;text-align:center width=600><table align=center style=text-align:center;vertical-align:top;width:600px;max-width:600px;background-color:#fff width=600><tr><td style=width:596px;vertical-align:top;padding-left:30px;padding-right:30px;padding-top:30px;padding-bottom:0 width=596><h1 style=font-size:20px;line-height:24px;font-family:Helvetica,Arial,sans-serif;font-weight:600;text-decoration:none;color:#000;margin-bottom:0>Date, Time & Venue</h1></table><table align=center style=text-align:center;vertical-align:top;width:600px;max-width:600px;background-color:#fff width=600><tr><td style=width:252px;vertical-align:top;padding-left:30px;padding-right:15px;padding-top:0;padding-bottom:30px;text-align:center width=252><p style=font-size:15px;line-height:24px;font-family:Helvetica,Arial,sans-serif;font-weight:400;text-decoration:none;color:#919293>Granville Arts Center, 300 N 5th St, Garland, TX 75040.<td style=width:252px;vertical-align:top;padding-left:15px;padding-right:30px;padding-top:0;padding-bottom:30px;text-align:center width=252><p style=font-size:15px;line-height:24px;font-family:Helvetica,Arial,sans-serif;font-weight:400;text-decoration:none;color:#919293>Sep 3, 2023<p>4PM - 7PM (Seating starts at 3:30PM)</table><table align=center style=text-align:center;vertical-align:top;width:600px;max-width:600px;background-color:#000 width=600><tr><td style=width:596px;vertical-align:top;padding-left:30px;padding-right:30px;padding-top:30px;padding-bottom:30px width=596><p style=font-size:13px;line-height:24px;font-family:Helvetica,Arial,sans-serif;font-weight:400;text-decoration:none;color:#fff>Thank you so much for RSVP'ing to the event. We are excited to have you. We can't wait to see you there!<p style=margin-bottom:0;font-size:13px;line-height:24px;font-family:Helvetica,Arial,sans-serif;font-weight:400;text-decoration:none;color:#fff><a href=https://zeroperks.com/dance style=text-decoration:underline;color:#fff target=_blank>www.zeroperks.com/dance</a></table></div>`
    });
    
  } catch (error) {
    res.status(500).send({
      message: error,
      data
    });
    sendEmail({
      from: 'thaarikashanmugam@gmail.com',
      to: 'nethramr@gmail.com',
      subj: 'Error: Bharatanatyam Arangetram',
      content: `Error Occurred: \n name: ${name} \n email: ${email} \n phone: ${phone} \n guests: ${guests} \n timestamp: ${timestamp}`
  });
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
