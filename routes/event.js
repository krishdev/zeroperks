var express = require('express');
var router = express.Router();
const got = require('got');
const MarkdownIt = require('markdown-it'),
md = new MarkdownIt();
const config = require('../configs/config');
const {
    defaultLocals,
    timeSince
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

module.exports = router;