var express = require('express');
var router = express.Router();
const got = require('got');
var svgCaptcha = require('svg-captcha');
const config = require('../configs/config');
const { getDayMonthYearTime, getEventById, reminderEmailEvt } = require('../configs/common-setup');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

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
const { all } = require('p-cancelable');

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

router.get('/rishikas-arangetram', async function(req, res, next) {
  defaultLocals(req, res);
  res.render('partials/dance-rishi');
});

router.get('/baby-shower/', async function (req, res) {
  defaultLocals(req, res);
  res.render('partials/baby-shower');
})

router.post('/arrangetram-540', async function (req, res) {
  const db = admin.firestore();
  const docRef = db.collection('arangetram').doc();

  const data = req.body;
  const name = data.name;
  const email = data.email;
  const phone = data.phone;
  const guests = data.guests;
  const timestamp = new Date().toLocaleString();
  data.timestamp = timestamp;

  // Save the data to Firebase.
  try {
    //const db = await admin.firestore().collection("users").add(data);
    const response = await docRef.set(data);
    res.json({message: "Data saved", other: response});
    const templatePath = path.resolve(__dirname, '../views/email/arangetram-rsvp.ejs');
    console.log('templatePath', templatePath);

    ejs.renderFile(templatePath, { 
      title: 'Rishika\'s Bharatanatyam Arangetram',
      content: 'Mr Santhosh and Mrs Salini along with Natyom Dance Academy cordially invite you to their daughter Rishika\'s Bharatanatyam Arangetram Disciple of Smt. Praveena Vajja.',
      invitationLink: 'https://www.zeroperks.com/rishikas-arangetram',
      venue: 'Plaza Theater Garland, 521 W State St, Garland, TX 75040',
      date: 'Mar 17, 2024',
      time: '3PM - 6PM (Seating starts at 2:30PM)',
      image1: 'https://zeroperks.com/assets/gallery-rishi/t-7.JPG',
      image2: 'https://zeroperks.com/assets/gallery-rishi/t-11.JPG'

     }, (err, htmlFile) => {
      if (err) {
        console.error('Error rendering email EJS template:', err);
        return res.status(500).send('Error processing your request, please try after sometime.');
      }

      sendEmail({
        from: 'rshkpillai@gmail.com',
        to: email,
        subj: 'Rishika\'s Bharatanatyam Arangetram',
        content: htmlFile
      });

    });
    
  } catch (error) {
    res.status(500).send({
      message: error,
      data
    });
    sendEmail({
      from: 'rshkpillai@gmail.com',
      to: 'emailzeroperks@gmail.com',
      subj: 'Error: Bharatanatyam Arangetram',
      content: `Error Occurred: \n name: ${name} \n email: ${email} \n phone: ${phone} \n guests: ${guests} \n timestamp: ${timestamp}`
  });
  }
});

router.post('/arangetram-reminder-978', async function (req, res) {
  try {
    const db = admin.firestore();
    const participants = db.collection('participants');
    const response = await participants.get();
    let allData = response.docs.map(doc=>doc.data());
    let allEmails = [];
    if (allData && allData.length) {
      allData.forEach( item => {
        if (allEmails.indexOf(item.email) === -1) {
          allEmails.push(item.email);
        }
      });
    }
    for (let i = 0; i < allEmails.length; i++) {
      await reminderEmailEvt(allEmails[i]); 
    }
    
    res.json({message: "Email sent"});
  } catch (error) {
    res.json({message: "Error occurred"});
  }
});

router.post('/event-thankyou-621', async function (req, res) {
  try {
    const db = admin.firestore();
    const participants = db.collection('events');
    const response = await participants.get();
    let allData = response.docs.map(doc=>doc.data());
    let allEmails = [];
    if (allData && allData.length) {
      allData.forEach( item => {
        if (allEmails.indexOf(item.email) === -1) {
          allEmails.push(item.email);
        }
      });
    }
    for (let i = 0; i < allEmails.length; i++) {
      await reminderEmailEvt(allEmails[i]); 
    }
    
    res.json({message: "Email sent"});
  } catch (error) {
    res.json({message: "Error occurred"});
  }
});

router.post('/guest-book-messages', async function (req, res) {
  const db = admin.firestore();
  const docRef = db.collection('guestbook').doc();

  const data = req.body;
  const name = data.name;
  const email = data.email;
  const content = data.content;
  const timestamp = new Date().toLocaleString();
  data.timestamp = timestamp;

  // Save the data to Firebase.
  try {
    //const db = await admin.firestore().collection("users").add(data);
    const response = await docRef.set(data);
    res.json({message: "Data saved", other: response});

  } catch (error) {
    res.status(500).send({
      message: error,
      data
    });
    sendEmail({
      from: 'emailzeroperks@gmail.com',
      cc: 'thaarikashanmugam@gmail.com',
      to: 'nethramr@gmail.com',
      subj: 'Error: Bharatanatyam Arangetram',
      content: `Error Occurred saving guest book: \n name: ${name} \n email: ${email} \n content: ${content} \n timestamp: ${timestamp}`
  });
  }
});

router.get('/guest-book-messages', async function (req, res) {
  try {
    const db = admin.firestore();
    const guestbook = db.collection('guestbook');
    const response = await guestbook.get();
    let messages = response.docs.map(doc=>doc.data());

    res.json({message: "success", messages});

  }
  catch (error) {
    res.status(500).json({message: "error"});
  }
});

// const eventReminder = ``;
const thankyouSubject = 'Event Details - Join Us for Our Exciting Baby Shower & Gender Reveal! 🎉🎀'

router.get('/event-reminder-image', async (req, res) => {
  defaultLocals(req, res);
  // Log the request or update your database with relevant information here
  const publicFolderPath = path.join(__dirname, '..', 'public');
  try {
    const email = req.query ? req.query.id : null;
    const postId = req.query ? req.query.postId : null;
    
    const db = admin.firestore();
    const docRef = db.collection('eventEmailEngagements').doc();

    if (email) {
      const response = await docRef.set({email, postId});
    }
    
    // Send the image as a response
    const eventResBody = await getEventById(postId);
    if (eventResBody && eventResBody.length) {
      const thisPost = eventResBody[0];
      console.log("eventBanner: "+thisPost.eventBanner.url);
      res.sendFile(publicFolderPath+thisPost.eventBanner.url);  
    } else {
      res.sendFile(publicFolderPath +'/images/email-images/bangle-bg.jpg');  
    }
  } catch (error) {
    await sendEmail({
      from: 'emailzeroperks@gmail.com',
      to: 'mailkrishna2@gmail.com',
      subj: 'Error: getting email image',
      content: `Email error: ${error}`
    });
    res.sendFile(publicFolderPath +'/images/email-images/bangle-bg.jpg');  
  }
  
});


router.get('/arrangetram-6874', async function (req, res) {
 defaultLocals(req, res);
 const db = admin.firestore();
 const participants = db.collection('participants');
 const response = await participants.get();
 let allData = response.docs.map(doc=>doc.data());
 let totalGuests = 0;
 if (allData && allData.length) {
  allData.forEach( item => {
    const part = item.guests ? +item.guests : 0;
    totalGuests += part;
  })
 }
res.render('partials/dance-admin', {allData: allData, totalGuests});
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
