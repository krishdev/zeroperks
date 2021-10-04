var express = require('express');
var router = express.Router();
const got = require('got');
const config = require('../configs/config');
const {
    defaultLocals
} = require('../configs/common-setup');


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
    const response = await got.get(config.acl+'/posts?_where[url]='+req.params.url, {		
		responseType: 'json'
	})
    const recentResponsePosts = await got.get(config.acl+'/posts?_sort=createdAt:DESC&_start=0&_limit=5', {		
		responseType: 'json'
	})
    defaultLocals(req, res);
    const recentPostResponseBody = recentResponsePosts.body;
    const responseBody = response.body;
    if (!responseBody || responseBody.length === 0) {
        res.locals.message = "Page Not Found";
        res.locals.error = "Try different path.";

        // render the error page
        res.status(404);
        res.render('error');
    }
    let thisPost = responseBody[0];
    let responseComment = [];
    try {
        responseComment = await got.get(config.acl+'/comments?_sort=createdAt:DESC&_where[post]='+thisPost.id, {		
            responseType: 'json'
        })
    } catch (error) {
        console.log('Comments for posts: ', error);
    }
    thisPost.views += 1;    
    
    updatePost(thisPost.id, thisPost);
    res.render('partials/blog', {post:thisPost, recentPosts: recentPostResponseBody, comments: responseComment.body || []})
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

router.post('/comment', async function (req, res) {
    const params = req.body;
    try {
        const response = await got.post(config.acl + '/comments', {
            responseType: 'json',
            json: {
                "comment": params.comment,
                "post": params.postId,
                "user": req.session.userId
            },
            headers: {
              Authorization:
                'Bearer '+req.session.token,
            }
        })
        res.status(200).json({
            success: true,
            message: response.body
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error
        })
    }
    
})

module.exports = router;