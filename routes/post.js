var express = require('express');
var router = express.Router();
const got = require('got');
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
        });
        if (responseComment && responseComment.body.length) {
            responseComment.body.forEach (item => {
                item.timeSince = timeSince(new Date (item.published_at));
            })
        }
    } catch (error) {
        console.log('Comments for posts: ', error);
    }
    thisPost.views += 1;    
    
    updatePost(thisPost.id, thisPost);
    res.render('partials/blog', {post:thisPost, recentPosts: recentPostResponseBody, comments: responseComment.body || [], url: encodeURIComponent(`/post/${req.params.url}`)})
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

async function updateComment (id, data) {
    const copyHeaderesAuth = JSON.parse(JSON.stringify(config.headersAuth));
    copyHeaderesAuth['json'] = data;
    try {
        const response = await got.put(config.acl+'/comments/'+id, copyHeaderesAuth);
        if (response && response.body && response.body.id) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log('Comments Update error: ', error);
        return false;
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

router.post('/like', async function (req, res) {
    const postId = req.body.postId;
    const commentId = req.body.commentId;
    if (postId) {
        try {
            const getPostUrl = config.acl+'/posts/'+postId;
            const response = await got.get(getPostUrl, {		
                responseType: 'json'
            })
            const responseBody = response.body;
            if (responseBody && responseBody.id) {
                let thisPost = responseBody;
                if (!commentId) {
                    // add +1 to Post helpful
                    thisPost.helpful += 1;
                    updatePost(thisPost.id, thisPost);
                } else if (commentId){
                    // add +1 to Comment helpful
                    const commentResponse = await got.get(config.acl+'/comments/'+commentId, {		
                        responseType: 'json'
                    });
                    const commentBody = commentResponse.body;
                    if (commentBody && commentBody.id) {
                        let thisComment = commentBody;
                        thisComment.helpful += 1;
                        updateComment(thisComment.id, thisComment)
                    }
                }
                res.status(200).json({
                    success: true
                })
            } else {
                res.status(200).json({
                    success: false,
                    error: true,
                    error: 'Post Id invalid.'
                })
            }
        } catch (error) {
            sendEmail({
                from: 'mailkrishna2@gmail.com',
                to: 'mailkrishna2@gmail.com',
                subj: 'Zeroperks | Error occurred on Like API',
                content: `<p>${new Date().toString()}</p> ${error}`
            })
            res.status(200).json({
                success: false,
                error: true,
                error: error
            })
        }
    } else {
        res.status(200).json({
            success: false,
            error: true,
            error: 'Post ID required.'
        })
    }
})

module.exports = router;