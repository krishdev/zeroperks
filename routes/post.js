var express = require('express');
var router = express.Router();
const got = require('got');
const jwt = require('jsonwebtoken');
const MarkdownIt = require('markdown-it'),
md = new MarkdownIt();
const config = require('../configs/config');
const Comment = require('../models/Comment');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client('YOUR_GOOGLE_CLIENT_ID')
const {
    defaultLocals,
    timeSince
} = require('../configs/common-setup');
const {
    sendEmail
} = require('../controller/controller.email');
const { authRequired } = require('../middleware/authRequired');
const logger = require('../configs/logger');
const User = require('../models/User');


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
        responseComment = await Comment.find({ postId: thisPost.id, status: 'approved' })
                            .sort({ createdAt: -1 })
                            .populate('userId', 'username')
                            .exec();
        if (responseComment && responseComment.length) {
            responseComment.forEach (item => {
                item.timeSince = timeSince(new Date (item.createdAt));
            })
        }
    } catch (error) {
        console.log('Comments for posts: ', error);
    }
    thisPost.views += 1;
    
    updatePost(thisPost.id, thisPost);
    thisPost.content = md.render(thisPost.content);
    res.render('partials/blog', {post:thisPost, recentPosts: recentPostResponseBody, comments: responseComment || [], url: encodeURIComponent(`/post/${req.params.url}`)})
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

router.post('/comment', authRequired, async function (req, res) {
    const params = req.body;
    try {
        // Save comment to DB
        if (!params.postId || !params.comment) {
            return res.status(400).json({
                success: false,
                message: 'Post ID and comment are required.'
            });
        }
        const comment = new Comment({
            postId: params.postId,
            userId: req.user.userId,
            content: params.comment,
            parent: params.parent || null,
            status: 'approved'
        });

        comment.save();

        res.status(200).json({
            success: true,
            message: "Saved comment successfully."
        })
    } catch (error) {
        logger.error('Error while saving comment: ', error);
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
                    // Find comment by ID and update comment likes
                    const updated =  await Comment.findByIdAndUpdate(commentId, { $inc: { likes: 1 } }, { new: true });
     
                    // Prevent negative likes
                    if (updated.likes < 0) {
                        updated.likes = 0;
                        await updated.save();
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
            logger.error('Error while liking post/comment: ', error);
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

// GET Method to send client ID for Google One Tap
router.post('/get-client', async function (req, res) {
    try {
        res.status(200).json({
            clientId: config.googleClientId
        });
    } catch (error) {
        logger.error('Error while getting Google client ID: ', error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
});

// POST Method to handle Google One Tap response
router.post('/auth/google-one-tap', async function (req, res) {
    const response = req.body;
    if (response && response.credential) {
        try {
            const ticket = await client.verifyIdToken({
                idToken: response.credential,
                audience: config.googleClientId
            });
            const payload = ticket.getPayload();

            // Extract user info
            const { email, name } = payload;

            // Check if user exists
            let user = await User.findOne({ email });
            if (!user) {
                // Create new user if not exists
                user = await User.create({
                    email,
                    username: name || email.split('@')[0],
                    password: '', // or some placeholder
                    provider: 'google'
                });
            }

            // Create your own JWT
            const token = jwt.sign(
                { userId: user._id, username: user.username, email: user.email },
                config.jwtSecret,
                { expiresIn: '1h' }
            );

            res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'Strict',
                maxAge: 60 * 60 * 1000
            });

            res.json({ success: true });
        } catch (error) {
            logger.error('Error during Google One Tap authentication: ', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    } else {
        res.status(400).json({
            success: false,
            message: 'Invalid request.'
        });
    }
});

module.exports = router;