const express = require('express');
const router = express.Router();

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

module.exports = router;