const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const { getDayMonthYearTime, getEventById } = require('../configs/common-setup');

const {
sendEmail
} = require('../controller/controller.email');
const {
startSitemap
} = require('../controller/controller.scheduler');

const {
    getGitRepo
} = require('../configs/common-setup');

// POST API FETCH GIT REPOS
router.get('/git-repo/', async (req, res) => {
    const {
        perPage,
        page
    } = req.params;
    
    let allRepos = [];
    let errors = null;
    try {
        allRepos = getGitRepo (perPage, page);
    } catch (error) {
        errors = error;
    }
    res.status(200).json({
        success: errors ? true : false,
        allRepos,
        errors
    })
});

router.post('/send-email/', (req, res) => {
    if (req.session.captcha && req.session.captcha === req.body.verificationText) {
        sendEmail(req.body);
        res.status(200).json({
            success: true
        })
    } else {
        res.status(200).json({
            success: false,
            error: true,
            message: 'Invalid Verification'
        })
    }
})

router.post('/generate-sitemap/', (req, res) => {
    startSitemap();
    res.status(200).json({
        success: true
    })
});

router.post('/rsvp-event', async function (req, res) {
    const db = admin.firestore();
    const docRef = db.collection('events').doc();
  
    const data = req.body;
    const name = data.name;
    const email = data.email;
    const phone = data.phone;
    const guests = data.guests;
    const eventId = data.postId;
    const timestamp = new Date().toLocaleString();
    data.timestamp = timestamp;
  
    // Save the data to Firebase.
    try {
      //const db = await admin.firestore().collection("users").add(data);
      const response = await docRef.set(data);
  
  
      const eventResBody = await getEventById(eventId) || null;
      if (eventResBody && eventResBody.length) {
        let thisPost = eventResBody[0];
        var eventDate = getDayMonthYearTime(thisPost.eventDate);
        res.json({message: "Data saved", other: response});
        
        sendEmail({
            from: 'emailzeroperks@gmail.com',
            to: email,
            subj: thisPost.eventName,
            content: `<!doctypehtml><html xmlns=http://www.w3.org/1999/xhtml xmlns:o=urn:schemas-microsoft-com:office:office xmlns:v=urn:schemas-microsoft-com:vml><head><!--[if gte mso 9]><xml><o:officedocumentsettings><o:allowpng><o:pixelsperinch>96</o:pixelsperinch></o:officedocumentsettings></xml><![endif]--><meta content="text/html; charset=UTF-8"http-equiv=Content-Type><meta content="width=device-width,initial-scale=1"name=viewport><meta name=x-apple-disable-message-reformatting><!--[if !mso]><!--><meta content="IE=edge"http-equiv=X-UA-Compatible><!--<![endif]--><title>Event</title><style>a,a:hover,a:link,a:visited,a[href]{text-decoration:none!important;color:#00e}.link{text-decoration:underline!important}p,p:visited{font-size:15px;line-height:24px;font-family:Helvetica,Arial,sans-serif;font-weight:300;text-decoration:none;color:#000}h1{font-size:22px;line-height:24px;font-family:Helvetica,Arial,sans-serif;font-weight:400;text-decoration:none;color:#000}.ExternalClass font,.ExternalClass p,.ExternalClass span,.ExternalClass td{line-height:100%}.ExternalClass{width:100%}</style><body align=center style=text-align:center;margin:0;padding-top:10px;padding-bottom:10px;padding-left:0;padding-right:0;-webkit-text-size-adjust:100%;background-color:#f2f4f6;color:#000><div style=text-align:center><table align=center style=text-align:center;vertical-align:top;width:600px;max-width:600px;background-color:#fff width=600><tr><td style=width:596px;vertical-align:top;padding-left:0;padding-right:0;padding-top:15px;padding-bottom:15px width=596><h1>${thisPost.eventName}</h1></table><img align=center alt="Hero image"height=350 src=https://admin.zeroperks.com/${thisPost.eventBanner.url} style=width:600px;max-width:600px;height:350px;max-height:350px;text-align:center width=600><table align=center style=text-align:center;vertical-align:top;width:600px;max-width:600px;background-color:#fff width=600><tr><td style=width:596px;vertical-align:top;padding-left:30px;padding-right:30px;padding-top:30px;padding-bottom:40px width=596><h1 style=font-size:20px;line-height:24px;font-family:Helvetica,Arial,sans-serif;font-weight:600;text-decoration:none;color:#000>Invitation</h1><p style=font-size:15px;line-height:24px;font-family:Helvetica,Arial,sans-serif;font-weight:400;text-decoration:none;color:#919293>${thisPost.shortInvite}</p><a href=https://zeroperks.com/event/${thisPost.url}/ style="background-color:#000;font-size:15px;line-height:22px;font-family:Helvetica,Arial,sans-serif;font-weight:400;text-decoration:none;padding:12px 15px;color:#fff;border-radius:5px;display:inline-block;mso-padding-alt:0"target=_blank><!--[if mso]><i style=letter-spacing:25px;mso-font-width:-100%;mso-text-raise:30pt> </i><![endif]--> <span style=mso-text-raise:15pt;color:#fff>Learn More</span><!--[if mso]><i style=letter-spacing:25px;mso-font-width:-100%> </i><![endif]--></a></table><table align=center style=text-align:center;vertical-align:top;width:600px;max-width:600px;background-color:#fff width=600><tr><td style=width:596px;vertical-align:top;padding-left:30px;padding-right:30px;padding-top:30px;padding-bottom:0 width=596><h1 style=font-size:20px;line-height:24px;font-family:Helvetica,Arial,sans-serif;font-weight:600;text-decoration:none;color:#000;margin-bottom:0>Date, Time & Venue</h1></table><table align=center style=text-align:center;vertical-align:top;width:600px;max-width:600px;background-color:#fff width=600><tr><td style=width:252px;vertical-align:top;padding-left:30px;padding-right:15px;padding-top:0;padding-bottom:30px;text-align:center width=252><p style=font-size:15px;line-height:24px;font-family:Helvetica,Arial,sans-serif;font-weight:400;text-decoration:none;color:#919293>${thisPost.eventVenue}. ${thisPost.eventTime}<td style=width:252px;vertical-align:top;padding-left:15px;padding-right:30px;padding-top:0;padding-bottom:30px;text-align:center width=252><p style=font-size:15px;line-height:24px;font-family:Helvetica,Arial,sans-serif;font-weight:400;text-decoration:none;color:#919293>${eventDate}<p>${thisPost.eventTime}</table><table align=center style=text-align:center;vertical-align:top;width:600px;max-width:600px;background-color:#000 width=600><tr><td style=width:596px;vertical-align:top;padding-left:30px;padding-right:30px;padding-top:30px;padding-bottom:30px width=596><p style=font-size:13px;line-height:24px;font-family:Helvetica,Arial,sans-serif;font-weight:400;text-decoration:none;color:#fff>Thank you so much for RSVP'ing to the event. We are excited to have you. We can't wait to see you there!<p style=font-size:13px;line-height:24px;font-family:Helvetica,Arial,sans-serif;font-weight:400;text-decoration:none;color:#fff>Krishna & Sabha<p style=margin-bottom:0;font-size:13px;line-height:24px;font-family:Helvetica,Arial,sans-serif;font-weight:400;text-decoration:none;color:#fff><a href=https://zeroperks.com/ style=text-decoration:underline;color:#fff target=_blank>www.zeroperks.com</a></table></div>`
        });
      }
      
    } catch (error) {
        res.status(500).send({
            message: error,
            data
        });
        sendEmail({
            from: 'emailzeroperks@gmail.com',
            to: 'mailkrishna2@gmail.com',
            subj: 'Error: RSVP Event',
            content: `Error Occurred: \n name: ${name} \n email: ${email} \n phone: ${phone} \n guests: ${guests} \n timestamp: ${timestamp}`
        });
    }
});

module.exports = router;