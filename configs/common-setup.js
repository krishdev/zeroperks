const config = require('./config');
const got = require('got');
const {
  sendEmail
} = require('../controller/controller.email');
exports.defaultLocals = function (req, res) {
    res.locals.origin = config.env;
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

/**
 * 
 * @param {Date} date 
 * @returns String
 */
exports.timeSince = function (date) {

    var seconds = Math.floor((new Date() - date) / 1000);
  
    var interval = seconds / 31536000;
  
    if (interval > 1) {
        const intrl = Math.floor(interval);
      return intrl + " year" + (intrl > 1 ? 's' : '');
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        const intrl = Math.floor(interval);
      return intrl + " month" + (intrl > 1 ? 's' : '');
    }
    interval = seconds / 86400;
    if (interval > 1) {
        const intrl = Math.floor(interval);
      return intrl + " day" + (intrl > 1 ? 's' : '');
    }
    interval = seconds / 3600;
    if (interval > 1) {
        const intrl = Math.floor(interval);
      return intrl + " hour" + (intrl > 1 ? 's' : '');
    }
    interval = seconds / 60;
    if (interval > 1) {
        const intrl = Math.floor(interval);
      return intrl + " minute" + (intrl > 1 ? 's' : '');
    }
    const intrl = Math.floor(seconds);
    return intrl + " second" + (intrl > 1 ? 's' : '');
}

exports.getGitRepo = function (perPage, page) {
  return new Promise ((resolve, reject) => {
      const url = `https://api.github.com/users/krishdev/repos?sort=updated&per_page=${perPage}&page=${page}`;
      got.get(url).then(res => {
          const responseBody = res.body;
          if (responseBody && responseBody.length) {
              resolve(responseBody);
          } else {
              sendEmail({
                  from: 'mailkrishna2@gmail.com',
                  to: 'mailkrishna2@gmail.com',
                  subj: 'Zeroperks | Error occurred on GitRepo fetch',
                  content: `Came in empty. Api used ${url}`
              })
              resolve([]);
          }
      }, error => {
          sendEmail({
              from: 'mailkrishna2@gmail.com',
              to: 'mailkrishna2@gmail.com',
              subj: 'Zeroperks | Error occurred on GitRepo fetch',
              content: `<p>${new Date().toString()}</p> ${error}`
          })
          reject(error);
      });
  })
}