const jwt = require('jsonwebtoken');
const config = require('../configs/config.js');
const logger = require('../configs/logger.js');

const authOptioal = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        req.user = null;
        next();
        return;
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        logger.error('Authentication optional error: ' + error.message);
        req.user = null;
        next();
    }
}

exports.authOptioal = authOptioal;