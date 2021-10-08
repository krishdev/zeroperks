const express = require('express');
const router = express.Router();
const got = require('got');
const {
sendEmail
} = require('../controller/controller.email');
const {
startSitemap
} = require('../controller/controller.scheduler');

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

function getGitRepo (perPage, page) {
    return new Promise ((resolve, reject) => {
        got.get(`https://api.github.com/users/krishdev/repos?sort=updated&per_page=${perPage}&page=${page}`).then(res => {
            const responseBody = res.body;
            if (responseBody && responseBody.length) {
                resolve(responseBody);
            } else {
                resolve([]);
            }
        }, error => {
            reject(error);
        });
    })
}

router.post('/send-email/', (req, res) => {
        sendEmail(req.body);
        res.status(200).json({
            success: true
        })
})

router.post('/generate-sitemap/', (req, res) => {
    startSitemap();
    res.status(200).json({
        success: true
    })
});

exports.getGitRepo = getGitRepo;
module.exports = router;