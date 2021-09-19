const config = require('./config');
exports.defaultLocals = function (req, res) {
    res.locals.origin = process.env.NODE_ENV && process.env.NODE_ENV == 'production' ? 'https://zeroperks.com' : 'http://localhost:8080'
    res.locals.year = new Date().getFullYear();
    const token = req.session.token || null;
    res.locals.token = token;
    const username = req.session.username || null;
    res.locals.username = username;
    res.locals.aclPort = config.acl;
}

/**
 * 
 * @param {Object} req 
 * @param {Object} res 
 * @param {Object} err | err.message or err.status 
 */
exports.renderErrorPage = function (req, res, err) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
}