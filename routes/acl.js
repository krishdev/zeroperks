var express = require('express');
var router = express.Router();
const got = require('got');
const config = require('../configs/config');
const {
    defaultLocals
} = require('../configs/common-setup');



/* GET ACL page. */
router.get(['/','/:page'], async function(req, res, next) {
    const postsPerPage = 9;
    let current = req.params.page && req.params.page > 0 ? req.params.page : 1;
    let tempCurrent = current;
    let pageStart = current > 1 ? (postsPerPage * --tempCurrent) : 0;
    defaultLocals(req, res);
    const response = await got.get(config.acl+'/posts?_where[categories.name]=ACL&_sort=createdAt:DESC&_start='+pageStart+'&_limit='+postsPerPage, {		
        responseType: 'json'
    });
    const responseBody = response.body;
    const responseCount = await got.get(config.acl+'/posts/count', {		
		responseType: 'json'
	})
    const responseCountBody = responseCount.body;
    res.render('acl', {
        recentPosts: responseBody,        
        totalPosts: responseCountBody,
        pages: Math.ceil(responseCountBody/postsPerPage),
        current
    });
});

module.exports = router;
