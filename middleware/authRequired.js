const jwt = require('jsonwebtoken');
const config = require('../configs/config.js');
const logger = require('../configs/logger.js');


const authRequired = (req, res, next) => {
    const token = req.cookies.token;
    res.locals.token = token;

    if (!token) res.render('login', { error: 'You must be logged in to access this page.' });

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Authentication error: ' + error.message);
        res.render('login', { error: 'Invalid token. Please log in again.' });        
    }
}

exports.authRequired = authRequired;