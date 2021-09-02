var express = require('express');
var router = express.Router();
const got = require('got');
const config = require('../configs/config');
const {
    defaultLocals,
    renderErrorPage
} = require('../configs/common-setup');
const e = require('express');

/* GET Project page. */
router.get(['/:url','/:url/:page'], async function(req, res, next) {
    const postsPerPage = 9;
    let current = req.params.page && req.params.page > 0 ? req.params.page : 1;
    let categoryUrl = req.params.url || null;
    if (categoryUrl === null) {
        renderErrorPage(req, res, {
            message: 'Page Not Found',
            status: 404
        });
    } else {
        const categoryResponse = await got.get(config.acl+'/categories/?_url='+categoryUrl, {		
            responseType: 'json'
        });
        if (!categoryResponse || !categoryResponse.body || !categoryResponse.body.length) {
            // 404
            renderErrorPage(req, res, {
                message: 'Page Not Found',
                status: 404
            });
        } else {
            let tempCurrent = current;
            let category = categoryResponse.body[0]
            let pageStart = current > 1 ? (postsPerPage * --tempCurrent) : 0;
            defaultLocals(req, res);
            const response = await got.get(config.acl+'/posts?_where[categories.name]='+category.name+'&_sort=createdAt:DESC&_start='+pageStart+'&_limit='+postsPerPage, {		
                responseType: 'json'
            });
            const responseBody = response.body;
            const responseCount = await got.get(config.acl+'/posts/count', {		
                responseType: 'json'
            })
            const responseCountBody = responseCount.body;
            res.render('category-landing', {
                recentPosts: responseBody, 
                aclPort: config.acl,
                totalPosts: responseCountBody,
                pages: Math.ceil(responseCountBody/postsPerPage),
                current,
                category
            });
        }
    }
});

module.exports = router;