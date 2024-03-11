const express = require('express');
const admin = require('firebase-admin');
const router = express.Router();
const ejs = require("ejs");
const path = require('path');
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
        const templatePath = path.resolve(__dirname, '../views/email/event.ejs');

        ejs.renderFile(templatePath, { 
            title: thisPost.eventName,
            invitationBanner: `https://admin.zeroperks.com/${thisPost.eventBanner.url}`,
            heading: 'Invitation',
            content: thisPost.shortInvite,
            inviteLink: `https://zeroperks.com/event/${thisPost.url}`,
            venueAddress: `${thisPost.eventVenue}\n`,
            inviteDate: 'Mar 17, 2024',
            inviteTime: '3PM - 6PM (Seating starts at 2:30PM)'
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