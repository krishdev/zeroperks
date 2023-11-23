var express = require('express');
var router = express.Router();
const admin = require('firebase-admin');
const got = require('got');
const MarkdownIt = require('markdown-it'),
md = new MarkdownIt();
const config = require('../configs/config');
const {
    defaultLocals,
    getEventById,
    reminderEmailEvt
} = require('../configs/common-setup');
const {
    sendEmail
} = require('../controller/controller.email');


async function generateJWTStrapi () {
    try {
        const response = await got.post(config.acl+'/auth/local', {
            responseType: 'json',
            json: {
                "identifier": "krishnasinbox@outlook.com",
                "password": "AdminTest123"
            }
        });
        const responseBody = response.body;
        if (responseBody && responseBody.jwt) {
            config.jwt = responseBody.jwt;
            config.headersAuth = {
                headers: {
                  Authorization:
                    'Bearer '+ config.jwt,
                }
            };
        }
    } catch (error) {
        console.log('JWT error: ', error);
    }
    
    console.log('JWT initialized');
}

generateJWTStrapi ();

/* GET ACL article */
router.get('/:url', async function (req, res, next) {
    try {
        console.log('url entered....');
        const response = await got.get(config.acl+'/events?_where[url]='+req.params.url, {		
            responseType: 'json'
        })
        console.log('event entered..... ' + req.params.url);
        defaultLocals(req, res);
        const responseBody = response.body;
        if (!responseBody || responseBody.length === 0) {
            res.locals.message = "Page Not Found";
            res.locals.error = "Try different path.";
    
            // render the error page
            res.status(404);
            res.render('error');
        }
        let thisPost = responseBody[0];
        
        thisPost.eventDetails = md.render(thisPost.eventDetails);
        res.render('partials/events', {post:thisPost, url: encodeURIComponent(`/event/${req.params.url}`)})
    } catch (error) {
        res.locals.message = "Page Not Found";
        res.locals.error = "Try different path.";
        defaultLocals(req, res);
        res.status(500);
        res.render('error');
    }
    
})

async function updatePost (id, data) {
    const copyHeaderesAuth = JSON.parse(JSON.stringify(config.headersAuth));
    copyHeaderesAuth['json'] = data;
    try {
        const response = await got.put(config.acl+'/posts/'+id, copyHeaderesAuth);
        if (response && response.body && response.body.id) {
            console.log('updated');
        }
    } catch (error) {
        console.log('POST Update error: ', error);
    }
}

router.post('/event-reminder-621', async function (req, res) {
    try {
      const data = req.body;
      const eventId = data.eventId;
      const db = admin.firestore();
      const participants = db.collection('events').where('postId', "==", eventId);
      const response = await participants.get();
      let allData = response.docs.map(doc=>doc.data());
      const eventResBody = await getEventById(eventId);
      let allEmails = [];
      console.log("eventResBody: " + eventResBody.length);
      if (allData && allData.length) {
        allData.forEach( item => {
          if (allEmails.indexOf(item.email) === -1) {
            allEmails.push(item.email);
          }
        });
      }
      console.log("allEmails: " + allEmails.length);
      if (eventResBody && eventResBody.length) {
        const thisEvent = eventResBody[0];
        thisEvent.reminderEventContent = md.render(thisEvent.reminderEventContent);
        console.log("reminderEventContent: " + thisEvent.reminderEventContent);
        for (let i = 0; i < allEmails.length; i++) {
            console.log("allEmails: " + allEmails[i]);
            await reminderEmailEvt(allEmails[i], thisEvent); 
        }
        console.log("email sent");
      }
      
      res.json({message: "Email sent"});
    } catch (error) {
      res.json({message: "Error occurred", error});
    }
});

module.exports = router;