var express = require('express');
var router = express.Router();
const got = require('got');
var svgCaptcha = require('svg-captcha');
const config = require('../configs/config');
const { getDayMonthYearTime, getEventById, reminderEmailEvt } = require('../configs/common-setup');
const admin = require('firebase-admin');
const path = require('path');
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

router.get('/baby-shower/', function (req, res) {
  res.render('partials/baby-shower');
})

router.post('/arrangetram-540', async function (req, res) {
  const db = admin.firestore();
  const docRef = db.collection('participants').doc();

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

    
    sendEmail({
        from: 'emailzeroperks@gmail.com',
        cc: 'thaarikashanmugam@gmail.com',
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
      from: 'emailzeroperks@gmail.com',
      cc: 'thaarikashanmugam@gmail.com',
      to: 'nethramr@gmail.com',
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

// const eventReminder = `<html xmlns:v=urn:schemas-microsoft-com:vml><title></title><meta charset=UTF-8><meta content="IE=edge"http-equiv=X-UA-Compatible><meta content="width=device-width,initial-scale=1"name=viewport><style id=aw-autoinject>a,body{word-break:break-word}.feed__title a{text-decoration:underline}.text-element h1{color:inherit;font-family:inherit;font-size:36px;line-height:1.15;font-weight:700;margin:.5em 0}.text-element h2{color:inherit;font-family:inherit;font-size:32px;line-height:1.15;font-weight:700;margin:.5em 0}.text-element h3{color:inherit;font-family:inherit;font-size:28px;line-height:1.15;font-weight:700;margin:.5em 0}.text-element h4{color:inherit;font-family:inherit;font-size:24px;line-height:1.15;font-weight:700;margin:.5em 0}.text-element h5{color:inherit;font-family:inherit;font-size:20px;line-height:1.15;font-weight:700;margin:.5em 0}.text-element h6{color:inherit;font-family:inherit;font-size:16px;line-height:1.15;font-weight:700;margin:.5em 0}.paragraph p,.text-element p{color:inherit;font-family:inherit;font-size:16px;line-height:1.5;margin:0}.text-element div{color:inherit;font-family:inherit;font-size:16px;line-height:1.5;margin:0}.text-element pre{color:inherit;display:block;font-family:monospace;font-size:16px;line-height:1;margin:1em auto;white-space:pre;max-width:500px;overflow:auto;overflow-wrap:break-word}.text-element address{color:inherit;font-family:inherit;display:block;font-size:16px;font-style:italic;line-height:1.15;margin:.5em 0}.headline blockquote,.paragraph blockquote,.text-element blockquote{border-left:5px solid #ccc;font-style:normal;margin-left:0;margin-right:0;overflow:hidden;padding-left:15px!important;padding-right:15px!important;box-sizing:border-box}@media only screen and (max-width:599px){img{max-width:100%!important;min-height:1px!important;height:auto!important}.text-element pre{max-width:250px}.aw-stack .container{box-sizing:border-box;display:block!important;float:left;max-width:100%!important;margin:auto;width:100%!important}.video .video-content{width:auto!important}.feed__item--block,.feed__item--postcard-main,.feed__item--postcard-side{box-sizing:border-box;display:block!important;max-width:100%!important;margin:auto;width:100%!important}.feed__item--block>div{margin:0 0 16px 0!important}.feed__image{width:100%!important}.feed__spacer{display:none!important}}</style><style>v:*{behavior:url(#default#VML);display:inline-block}#bodyCell,#bodyTable,body{height:100%;margin:0;padding:0;width:100%}body{background-color:#fefefe;color:#333;font-family:Helvetica,Arial,sans-serif;font-size:18px;line-height:1.5em;font-weight:400!important;height:100%;margin:0!important;padding:0!important;width:100%}body,table,td{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border:0;font-size:18px;mso-table-lspace:0;mso-table-rspace:0}img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;max-width:100%;outline:0;text-decoration:none;color:#333;font-size:20px;font-weight:700;border-radius:10px}.temp-header img{border-radius:0}table{border-collapse:collapse!important}strong{font-weight:700}.container{padding:0}.floated-none td{padding:0}.contained{max-width:600px;width:100%}.contained img{height:auto!important;max-width:100%!important}.paragraph div,.paragraph p{color:#333;font-family:Helvetica,Arial,sans-serif;font-size:18px;line-height:125%;font-weight:400;text-align:left}.text-element div,.text-element p{color:#333;font-family:Helvetica,Arial,sans-serif;font-size:18px;line-height:125%;font-weight:400;text-align:left}.paragraph a,.text-element a{color:#000;font-weight:700}.headline{color:#333;font-family:Helvetica,Arial,sans-serif;font-size:36px;line-height:125%;font-weight:700;text-align:left}.headline a{color:#333;text-decoration:none;font-weight:700}.temp-footer .paragraph div,.temp-footer .paragraph p{color:#7c7c7c;font-size:14px;line-height:125%}.temp-footer .text-element div,.temp-footer .text-element p{color:#7c7c7c;font-size:14px;line-height:125%}.temp-footer .headline{color:#7c7c7c;font-size:16px}.temp-footer .paragraph a,.temp-footer .text-element a{color:#7c7c7c}.temp-product .temp-padding{padding:10px}.temp-product .image{max-width:100%;height:auto;padding-bottom:0}.temp-product .image img{border-radius:4px}.temp-product img a{text-decoration:none!important}.temp-product .temp-headline{color:#333;font-size:18px;line-height:1.15em;max-width:100%;text-align:left}.temp-product .temp-paragraph{font-size:18px;line-height:1.25em;font-weight:400;max-width:100%;text-align:left;padding-top:2px}.temp-product .temp-price{font-size:20px;line-height:1.15em;font-weight:500;max-width:100%;text-align:left;padding-top:2px}.temp-product a{color:#333;font-weight:700;text-decoration:none!important}.temp-product .temp-button-padding table{width:100%}.coupon .headline{font-size:20px;text-align:center}.coupon .paragraph{text-align:center}.temp-article .headline{font-size:24px;margin:0;text-align:left!important}.temp-article .paragraph{text-align:left!important}.temp-article td{padding:0}.temp-article .padding{padding-bottom:10px}.temp-article .read-more{text-align:left}.temp-article a{color:#333}.clear{clear:both}.aw-image-link{border:0;text-decoration:none}ol,ul{color:#333}li{color:#333}a[x-apple-data-detectors]{border-bottom:none!important;color:inherit!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important;text-decoration:none!important}center>div{box-sizing:border-box}@media screen and (max-width:599px){#bodyCell,#bodyTable,body{width:100%!important;margin:auto;clear:both!important;display:block}img{max-width:100%!important;height:auto!important;max-height:300%}.paragraph{font-size:18px!important}.headline{font-size:28px!important}.temp-footer .paragraph{font-size:14px!important}.temp-footer .headline{font-size:16px!important}.share img{width:20px!important;height:auto!important;display:inline-block}.temp-button-padding td{padding:10px 20px!important}.video td{display:table-cell!important;text-align:center!important}.temp-article div{box-sizing:border-box!important;display:block!important;width:100%!important}.floated-left{display:inline-table!important;width:100%!important;text-align:center!important}.floated-left td{padding:10px 0!important}.floated-right{display:inline-table!important;width:100%!important;text-align:center!important}.floated-right td{padding:10px 0!important}.signature_spacer{display:none!important}.signature_content{text-align:center!important}}@media only screen and (min-width:10px) and (max-width:599px){u~div img{width:auto!important}}</style><center><div align=center><table role=presentation style=background-color:#f8f8f8;font-weight:400;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px class=aw-bgc align=center width=100% border=0 cellpadding=0 cellspacing=0><tr><td style=text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px class=temp-wrapper><div align=center><!--[if (gte mso 9)]><table role=presentation border=0 cellspacing=0 cellpadding=0 width=600 align=center><tr><td class=temp-header><![endif]--><div class=temp-header style=max-width:600px><div class="contained temp-fullbleed"style=max-width:600px;width:100%><div class=region><div><table role=presentation style=width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px class="aw-stack row"><tr><td style="padding:30px 20px;width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px"class=container valign=top width=100%><div class=definition-parent><span><table role=presentation style=float:none;text-align:center;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px class=floated-none align=center width=100%><tr></table></span></div></table></div></div></div></div><!--[if (gte mso 9)]><![endif]--><!--[if (gte mso 9)]><table role=presentation border=0 cellspacing=0 cellpadding=0 width=600 align=center bgcolor=#ffffff><tr><td class=temp-body><![endif]--><div class=temp-body style=background-color:#fff;border-radius:10px;max-width:600px><div class="contained temp-fullbleed"style=max-width:600px;width:100%><div class=region><div><table role=presentation style=width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px class="aw-stack row"><tr><td style=padding:0;width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px class=container valign=top width=100%><div class=definition-parent><span><table role=presentation style=float:none;text-align:center;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px class=floated-none align=center width=100%><tr><td style=padding:0;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px align=center><a href=http://www.aweber.com style=border-width:0;border-style:none;text-decoration:none target=_blank class=aw-image-link rel="noopener noreferrer"><img alt=Image class=model height=283 src="https://zeroperks.com/event-reminder-image?id=${email}"style=display:block;width:600px;height:283px;border-width:0;border-style:none;line-height:100%;max-width:100%;outline-width:medium;outline-style:none;text-decoration:none;color:#333;font-size:20px;font-weight:700;border-radius:10px width=600></a></table></span></div></table><table role=presentation style=width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px class="aw-stack row"><tr><td style=padding:30px;width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px class=container valign=top width=100%><div class=definition-parent><div class="paragraph text-element"><div style=color:#333;font-family:Helvetica,Arial,sans-serif;font-size:18px;line-height:125%;font-weight:400;text-align:left><h4>Event Information - Baby Shower & Gender Reveal Celebration!</h4><p style=color:#333;font-family:Helvetica,Arial,sans-serif;font-size:18px;line-height:125%;font-weight:400;text-align:left> <p style=color:#333;font-family:Helvetica,Arial,sans-serif;font-size:18px;line-height:125%;font-weight:400;text-align:left>We hope this message finds you well! As the excitement continues to build, we wanted to send you a friendly reminder about our upcoming Baby Shower and Gender Reveal celebration.</div></div></div><div class=definition-parent><div class=divider><table role=presentation style=text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px width=100% cellpadding=0 cellspacing=0><tr><td style="padding:20px 0;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px"class=divider-container><table role=presentation style="border-width:1px 0 0;border-style:solid none none;border-top-color:#dee0e8;border-collapse:collapse;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-spacing:0;font-size:18px"width=100%><tr><td style=text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px width=100%></table></table></div></div><div class=definition-parent><div class="paragraph text-element"><div style=color:#333;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:125%;font-weight:400;text-align:left><ul style=color:#333><li style=color:#333>Event Date: Sep 10, 2023<li style=color:#333>Event Venue: Hello India banquet hall. 8740 Ohio Dr suite c, Plano, TX 75024<li style=color:#333>Event Time: Sun Morning @ 11 AM<li style=color:#333>What to wear: Ethnic Attire<li style=color:#333>What to Bring: Your presence is the greatest gift of all, but if you wish to bring a little something, gift cards are appreciated.</ul></div></div></div><div class=definition-parent><div class=divider><table role=presentation style=text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px width=100% cellpadding=0 cellspacing=0><tr><td style="padding:10px 0 20px;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px"class=divider-container><table role=presentation style="border-width:1px 0 0;border-style:solid none none;border-top-color:#dee0e8;border-collapse:collapse;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-spacing:0;font-size:18px"width=100%><tr><td style=text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px width=100%></table></table></div></div><div class=definition-parent><div class="paragraph text-element"><div style=color:#333;font-family:Helvetica,Arial,sans-serif;font-size:18px;line-height:125%;font-weight:400;text-align:left><p style=color:#333;font-family:Helvetica,Arial,sans-serif;font-size:18px;line-height:125%;font-weight:400;text-align:left>The function is filled with games, laughter, delicious food, and heartwarming moments. Be prepared to enjoy fun activities, delightful treats, and, of course, an opportunity to shower our baby with love.<div style=text-align:center><a href=https://zeroperks.com/event/baby-shower-sabha-krishna/ style="background-color:#000;font-size:15px;line-height:22px;font-family:Helvetica,Arial,sans-serif;font-weight:400;text-decoration:none;padding:12px 15px;color:#fff;border-radius:5px;display:inline-block;mso-padding-alt:0"target=_blank><!--[if mso]><i style=letter-spacing:25px;mso-font-width:-100%;mso-text-raise:30pt> </i><![endif]--> <span style=mso-text-raise:15pt;color:#fff>View Invitation</span><!--[if mso]><i style=letter-spacing:25px;mso-font-width:-100%> </i><![endif]--></a></div></div></div></div></table></div></div></div></div><!--[if (gte mso 9)]><![endif]--><!--[if (gte mso 9)]><table role=presentation border=0 cellspacing=0 cellpadding=0 width=600 align=center><tr><td class=temp-footer><![endif]--><div class=temp-footer style=max-width:600px><div class="contained temp-fullbleed"style=max-width:600px;width:100%><div class=region><div><table role=presentation style=width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px class="aw-stack row"><tr><td style="padding:30px 20px;width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px"class=container valign=top width=100%><div class=definition-parent><div class="align-center social social--circle social--sm"></div></div><div class=definition-parent><div class="paragraph text-element"><div style=color:#7c7c7c;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:125%;font-weight:400;text-align:left><div style=text-align:center;color:#7c7c7c;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:125%;font-weight:400> Krishna & Sabha </div></div></div></div></table></div></div></div></div><!--[if (gte mso 9)]><![endif]--></div></table></div></center><div></div>`;
const eventSubj = 'Thank You for Joining Us and Making the Event Fun and Exciting! 🎉🎀';
const thankyouEmail = `<html xmlns:v=urn:schemas-microsoft-com:vml><title></title><meta charset=UTF-8><meta content="IE=edge"http-equiv=X-UA-Compatible><meta content="width=device-width,initial-scale=1"name=viewport><style id=aw-autoinject>a,body{word-break:break-word}.feed__title a{text-decoration:underline}.text-element h1{color:inherit;font-family:inherit;font-size:36px;line-height:1.15;font-weight:700;margin:.5em 0}.text-element h2{color:inherit;font-family:inherit;font-size:32px;line-height:1.15;font-weight:700;margin:.5em 0}.text-element h3{color:inherit;font-family:inherit;font-size:28px;line-height:1.15;font-weight:700;margin:.5em 0}.text-element h4{color:inherit;font-family:inherit;font-size:24px;line-height:1.15;font-weight:700;margin:.5em 0}.text-element h5{color:inherit;font-family:inherit;font-size:20px;line-height:1.15;font-weight:700;margin:.5em 0}.text-element h6{color:inherit;font-family:inherit;font-size:16px;line-height:1.15;font-weight:700;margin:.5em 0}.paragraph p,.text-element p{color:inherit;font-family:inherit;font-size:16px;line-height:1.5;margin:0}.text-element div{color:inherit;font-family:inherit;font-size:16px;line-height:1.5;margin:0}.text-element pre{color:inherit;display:block;font-family:monospace;font-size:16px;line-height:1;margin:1em auto;white-space:pre;max-width:500px;overflow:auto;overflow-wrap:break-word}.text-element address{color:inherit;font-family:inherit;display:block;font-size:16px;font-style:italic;line-height:1.15;margin:.5em 0}.headline blockquote,.paragraph blockquote,.text-element blockquote{border-left:5px solid #ccc;font-style:normal;margin-left:0;margin-right:0;overflow:hidden;padding-left:15px!important;padding-right:15px!important;box-sizing:border-box}@media only screen and (max-width:599px){img{max-width:100%!important;min-height:1px!important;height:auto!important}.text-element pre{max-width:250px}.aw-stack .container{box-sizing:border-box;display:block!important;float:left;max-width:100%!important;margin:auto;width:100%!important}.video .video-content{width:auto!important}.feed__item--block,.feed__item--postcard-main,.feed__item--postcard-side{box-sizing:border-box;display:block!important;max-width:100%!important;margin:auto;width:100%!important}.feed__item--block>div{margin:0 0 16px 0!important}.feed__image{width:100%!important}.feed__spacer{display:none!important}}</style><style>v:*{behavior:url(#default#VML);display:inline-block}#bodyCell,#bodyTable,body{height:100%;margin:0;padding:0;width:100%}body{background-color:#fefefe;color:#333;font-family:Helvetica,Arial,sans-serif;font-size:18px;line-height:1.5em;font-weight:400!important;height:100%;margin:0!important;padding:0!important;width:100%}body,table,td{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border:0;font-size:18px;mso-table-lspace:0;mso-table-rspace:0}img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;max-width:100%;outline:0;text-decoration:none;color:#333;font-size:20px;font-weight:700;border-radius:10px}.temp-header img{border-radius:0}table{border-collapse:collapse!important}strong{font-weight:700}.container{padding:0}.floated-none td{padding:0}.contained{max-width:600px;width:100%}.contained img{height:auto!important;max-width:100%!important}.paragraph div,.paragraph p{color:#333;font-family:Helvetica,Arial,sans-serif;font-size:18px;line-height:125%;font-weight:400;text-align:left}.text-element div,.text-element p{color:#333;font-family:Helvetica,Arial,sans-serif;font-size:18px;line-height:125%;font-weight:400;text-align:left}.paragraph a,.text-element a{color:#000;font-weight:700}.headline{color:#333;font-family:Helvetica,Arial,sans-serif;font-size:36px;line-height:125%;font-weight:700;text-align:left}.headline a{color:#333;text-decoration:none;font-weight:700}.temp-footer .paragraph div,.temp-footer .paragraph p{color:#7c7c7c;font-size:14px;line-height:125%}.temp-footer .text-element div,.temp-footer .text-element p{color:#7c7c7c;font-size:14px;line-height:125%}.temp-footer .headline{color:#7c7c7c;font-size:16px}.temp-footer .paragraph a,.temp-footer .text-element a{color:#7c7c7c}.temp-product .temp-padding{padding:10px}.temp-product .image{max-width:100%;height:auto;padding-bottom:0}.temp-product .image img{border-radius:4px}.temp-product img a{text-decoration:none!important}.temp-product .temp-headline{color:#333;font-size:18px;line-height:1.15em;max-width:100%;text-align:left}.temp-product .temp-paragraph{font-size:18px;line-height:1.25em;font-weight:400;max-width:100%;text-align:left;padding-top:2px}.temp-product .temp-price{font-size:20px;line-height:1.15em;font-weight:500;max-width:100%;text-align:left;padding-top:2px}.temp-product a{color:#333;font-weight:700;text-decoration:none!important}.temp-product .temp-button-padding table{width:100%}.coupon .headline{font-size:20px;text-align:center}.coupon .paragraph{text-align:center}.temp-article .headline{font-size:24px;margin:0;text-align:left!important}.temp-article .paragraph{text-align:left!important}.temp-article td{padding:0}.temp-article .padding{padding-bottom:10px}.temp-article .read-more{text-align:left}.temp-article a{color:#333}.clear{clear:both}.aw-image-link{border:0;text-decoration:none}ol,ul{color:#333}li{color:#333}a[x-apple-data-detectors]{border-bottom:none!important;color:inherit!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important;text-decoration:none!important}center>div{box-sizing:border-box}@media screen and (max-width:599px){#bodyCell,#bodyTable,body{width:100%!important;margin:auto;clear:both!important;display:block}img{max-width:100%!important;height:auto!important;max-height:300%}.paragraph{font-size:18px!important}.headline{font-size:28px!important}.temp-footer .paragraph{font-size:14px!important}.temp-footer .headline{font-size:16px!important}.share img{width:20px!important;height:auto!important;display:inline-block}.temp-button-padding td{padding:10px 20px!important}.video td{display:table-cell!important;text-align:center!important}.temp-article div{box-sizing:border-box!important;display:block!important;width:100%!important}.floated-left{display:inline-table!important;width:100%!important;text-align:center!important}.floated-left td{padding:10px 0!important}.floated-right{display:inline-table!important;width:100%!important;text-align:center!important}.floated-right td{padding:10px 0!important}.signature_spacer{display:none!important}.signature_content{text-align:center!important}}@media only screen and (min-width:10px) and (max-width:599px){u~div img{width:auto!important}}</style><center><div align=center><table role=presentation style=background-color:#f8f8f8;font-weight:400;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px class=aw-bgc align=center width=100% border=0 cellpadding=0 cellspacing=0><tr><td style=text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px class=temp-wrapper><div align=center><!--[if (gte mso 9)]><table role=presentation border=0 cellspacing=0 cellpadding=0 width=600 align=center><tr><td class=temp-header><![endif]--><div class=temp-header style=max-width:600px><div class="contained temp-fullbleed"style=max-width:600px;width:100%><div class=region><div><table role=presentation style=width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px class="aw-stack row"><tr><td style="padding:30px 20px;width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px"class=container valign=top width=100%><div class=definition-parent><span><table role=presentation style=float:none;text-align:center;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px class=floated-none align=center width=100%><tr></table></span></div></table></div></div></div></div><!--[if (gte mso 9)]><![endif]--><!--[if (gte mso 9)]><table role=presentation border=0 cellspacing=0 cellpadding=0 width=600 align=center bgcolor=#ffffff><tr><td class=temp-body><![endif]--><div class=temp-body style=background-color:#fff;border-radius:10px;max-width:600px><div class="contained temp-fullbleed"style=max-width:600px;width:100%><div class=region><div><table role=presentation style=width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px class="aw-stack row"><tr><td style=padding:0;width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px class=container valign=top width=100%><div class=definition-parent><span><table role=presentation style=float:none;text-align:center;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px;background-color:#00f;color:#fff class=floated-none align=center width=100%><tr><td style=text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px;padding:2em 5em; align=center><div class=banner><h4 style=color:#fff>From Sabha & Krishna ❤️</h4><h1 style=color:#fff>We Feel <span>the Love</span></h1></div></table></span></div></table><table role=presentation style=width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px class="aw-stack row"><tr><td style=padding:30px;width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px class=container valign=top width=100%><div class=definition-parent><div class="paragraph text-element"><div style=color:#333;font-family:Helvetica,Arial,sans-serif;font-size:18px;line-height:125%;font-weight:400;text-align:left><p>Hi there!<p style=color:#333;font-family:Helvetica,Arial,sans-serif;font-size:18px;line-height:125%;font-weight:400;text-align:left>We wanted to say a <b>big thank you</b> for celebrating with us at our baby shower and gender reveal function. Your presence added so much joy to our day, and we appreciate your warm wishes and gifts. We can't wait for you to meet our little one!</div></div></div><div class=definition-parent><div class=divider><table role=presentation style=text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px width=100% cellpadding=0 cellspacing=0><tr><td style="padding:20px 0;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px"class=divider-container><table role=presentation style="border-width:1px 0 0;border-style:solid none none;border-top-color:#dee0e8;border-collapse:collapse;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-spacing:0;font-size:18px"width=100%><tr><td style=text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px width=100%></table></table></div></div><div class=definition-parent><div class="paragraph text-element"><p>Also please <b>share</b> all the event photos and videos to <b>mailkrishna2@gmail.com</b></div></div><div class=definition-parent><div class=divider><table role=presentation style=text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px width=100% cellpadding=0 cellspacing=0><tr><td style="padding:10px 0 20px;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px"class=divider-container></table></div></div><div class=definition-parent><div class="paragraph text-element"></div></div></table></div></div></div></div><!--[if (gte mso 9)]><![endif]--><!--[if (gte mso 9)]><table role=presentation border=0 cellspacing=0 cellpadding=0 width=600 align=center><tr><td class=temp-footer><![endif]--><div class=temp-footer style=max-width:600px><div class="contained temp-fullbleed"style=max-width:600px;width:100%><div class=region><div><table role=presentation style=width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px class="aw-stack row"><tr><td style="padding:30px 20px;width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px"class=container valign=top width=100%><div class=definition-parent><div class="align-center social social--circle social--sm"></div></div><div class=definition-parent><div class="paragraph text-element"><div style=color:#7c7c7c;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:125%;font-weight:400;text-align:left><div style=text-align:center;color:#7c7c7c;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:125%;font-weight:400> Krishna & Sabha </div></div></div></div></table></div></div></div></div><!--[if (gte mso 9)]><![endif]--></div></table></div></center><div></div>`;
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
