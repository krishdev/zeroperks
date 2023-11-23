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

/**
 * 
 * @param {String} dateTimeStr
 */
exports.getDayMonthYearTime = function (dateTimeStr) {
  if (!dateTimeStr) return null;
  if (dateTimeStr.indexOf('-') > -1) {
    const dtSplit = dateTimeStr.split('-');
    dateTimeStr = `${dtSplit[1]}/${dtSplit[2]}/${dtSplit[0]}`;
  }
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date(dateTimeStr);
  return `${days[now.getDay()]} ${months[now.getMonth()]} ${now.getDate()} ${now.getFullYear()}`;
}

/**
 * 
 * @param {String} eventId 
 * @returns event
 */
exports.getEventById = async (eventId) => {
  /** Get Event details */
  try {
    const eventRes = await got.get(config.acl+'/events?_where[id]='+eventId, {		
        responseType: 'json'
    })
    const eventResBody = eventRes.body;
    console.log("event body: "+ eventResBody.length);
    if (!eventResBody || eventResBody.length === 0) {
        return null;
    }
    return eventResBody;
  } catch (error) {
    console.log(error);
    return null;
  }
}

exports.reminderEmailEvt = async (email, eventDetails) => {
  try {
    await sendEmail({
      from: 'emailzeroperks@gmail.com',
      to: email,
      subj: eventDetails.eventNickName,
      content: `<html xmlns:v="urn:schemas-microsoft-com:vml"><title></title><meta charset="UTF-8"><meta content="IE=edge" http-equiv="X-UA-Compatible"><meta content="width=device-width,initial-scale=1" name="viewport"><style id="aw-autoinject">a,body{word-break:break-word}.feed__title a{text-decoration:underline}.text-element h1{color:inherit;font-family:inherit;font-size:36px;line-height:1.15;font-weight:700;margin:.5em 0}.text-element h2{color:inherit;font-family:inherit;font-size:32px;line-height:1.15;font-weight:700;margin:.5em 0}.text-element h3{color:inherit;font-family:inherit;font-size:28px;line-height:1.15;font-weight:700;margin:.5em 0}.text-element h4{color:inherit;font-family:inherit;font-size:24px;line-height:1.15;font-weight:700;margin:.5em 0}.text-element h5{color:inherit;font-family:inherit;font-size:20px;line-height:1.15;font-weight:700;margin:.5em 0}.text-element h6{color:inherit;font-family:inherit;font-size:16px;line-height:1.15;font-weight:700;margin:.5em 0}.paragraph p,.text-element p{color:inherit;font-family:inherit;font-size:16px;line-height:1.5;margin:0}.text-element div{color:inherit;font-family:inherit;font-size:16px;line-height:1.5;margin:0}.text-element pre{color:inherit;display:block;font-family:monospace;font-size:16px;line-height:1;margin:1em auto;white-space:pre;max-width:500px;overflow:auto;overflow-wrap:break-word}.text-element address{color:inherit;font-family:inherit;display:block;font-size:16px;font-style:italic;line-height:1.15;margin:.5em 0}.headline blockquote,.paragraph blockquote,.text-element blockquote{border-left:5px solid #ccc;font-style:normal;margin-left:0;margin-right:0;overflow:hidden;padding-left:15px!important;padding-right:15px!important;box-sizing:border-box}@media only screen and (max-width:599px){img{max-width:100%!important;min-height:1px!important;height:auto!important}.text-element pre{max-width:250px}.aw-stack .container{box-sizing:border-box;display:block!important;float:left;max-width:100%!important;margin:auto;width:100%!important}.video .video-content{width:auto!important}.feed__item--block,.feed__item--postcard-main,.feed__item--postcard-side{box-sizing:border-box;display:block!important;max-width:100%!important;margin:auto;width:100%!important}.feed__item--block>div{margin:0 0 16px 0!important}.feed__image{width:100%!important}.feed__spacer{display:none!important}}</style><style>v:*{behavior:url(#default#VML);display:inline-block}#bodyCell,#bodyTable,body{height:100%;margin:0;padding:0;width:100%}body{background-color:#fefefe;color:#333;font-family:Helvetica,Arial,sans-serif;font-size:18px;line-height:1.5em;font-weight:400!important;height:100%;margin:0!important;padding:0!important;width:100%}body,table,td{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border:0;font-size:18px;mso-table-lspace:0;mso-table-rspace:0}img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;max-width:100%;outline:0;text-decoration:none;color:#333;font-size:20px;font-weight:700;border-radius:10px}.temp-header img{border-radius:0}table{border-collapse:collapse!important}strong{font-weight:700}.container{padding:0}.floated-none td{padding:0}.contained{max-width:600px;width:100%}.contained img{height:auto!important;max-width:100%!important}.paragraph div,.paragraph p{color:#333;font-family:Helvetica,Arial,sans-serif;font-size:18px;line-height:125%;font-weight:400;text-align:left}.text-element div,.text-element p{color:#333;font-family:Helvetica,Arial,sans-serif;font-size:18px;line-height:125%;font-weight:400;text-align:left}.paragraph a,.text-element a{color:#000;font-weight:700}.headline{color:#333;font-family:Helvetica,Arial,sans-serif;font-size:36px;line-height:125%;font-weight:700;text-align:left}.headline a{color:#333;text-decoration:none;font-weight:700}.temp-footer .paragraph div,.temp-footer .paragraph p{color:#7c7c7c;font-size:14px;line-height:125%}.temp-footer .text-element div,.temp-footer .text-element p{color:#7c7c7c;font-size:14px;line-height:125%}.temp-footer .headline{color:#7c7c7c;font-size:16px}.temp-footer .paragraph a,.temp-footer .text-element a{color:#7c7c7c}.temp-product .temp-padding{padding:10px}.temp-product .image{max-width:100%;height:auto;padding-bottom:0}.temp-product .image img{border-radius:4px}.temp-product img a{text-decoration:none!important}.temp-product .temp-headline{color:#333;font-size:18px;line-height:1.15em;max-width:100%;text-align:left}.temp-product .temp-paragraph{font-size:18px;line-height:1.25em;font-weight:400;max-width:100%;text-align:left;padding-top:2px}.temp-product .temp-price{font-size:20px;line-height:1.15em;font-weight:500;max-width:100%;text-align:left;padding-top:2px}.temp-product a{color:#333;font-weight:700;text-decoration:none!important}.temp-product .temp-button-padding table{width:100%}.coupon .headline{font-size:20px;text-align:center}.coupon .paragraph{text-align:center}.temp-article .headline{font-size:24px;margin:0;text-align:left!important}.temp-article .paragraph{text-align:left!important}.temp-article td{padding:0}.temp-article .padding{padding-bottom:10px}.temp-article .read-more{text-align:left}.temp-article a{color:#333}.clear{clear:both}.aw-image-link{border:0;text-decoration:none}ol,ul{color:#333}li{color:#333}a[x-apple-data-detectors]{border-bottom:none!important;color:inherit!important;font-size:inherit!important;font-family:inherit!important;font-weight:inherit!important;line-height:inherit!important;text-decoration:none!important}center>div{box-sizing:border-box}@media screen and (max-width:599px){#bodyCell,#bodyTable,body{width:100%!important;margin:auto;clear:both!important;display:block}img{max-width:100%!important;height:auto!important;max-height:300%}.paragraph{font-size:18px!important}.headline{font-size:28px!important}.temp-footer .paragraph{font-size:14px!important}.temp-footer .headline{font-size:16px!important}.share img{width:20px!important;height:auto!important;display:inline-block}.temp-button-padding td{padding:10px 20px!important}.video td{display:table-cell!important;text-align:center!important}.temp-article div{box-sizing:border-box!important;display:block!important;width:100%!important}.floated-left{display:inline-table!important;width:100%!important;text-align:center!important}.floated-left td{padding:10px 0!important}.floated-right{display:inline-table!important;width:100%!important;text-align:center!important}.floated-right td{padding:10px 0!important}.signature_spacer{display:none!important}.signature_content{text-align:center!important}}@media only screen and (min-width:10px) and (max-width:599px){u~div img{width:auto!important}}</style><center><div align="center"><table role="presentation" style="background-color:#f8f8f8;font-weight:400;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px" class="aw-bgc" align="center" width="100%" border="0" cellpadding="0" cellspacing="0"><tr><td style="text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px" class="temp-wrapper"><div align="center"><!--[if (gte mso 9)]><table role="presentation" border="0" cellspacing="0" cellpadding="0" width="600" align="center"><tr><td class="temp-header"><![endif]--><div class="temp-header" style="max-width:600px"><div class="contained temp-fullbleed" style="max-width:600px;width:100%"><div class="region"><div><table role="presentation" style="width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px" class="aw-stack row"><tr><td style="padding:30px 20px;width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px" class="container" valign="top" width="100%"><div class="definition-parent"><span><table role="presentation" style="float:none;text-align:center;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px" class="floated-none" align="center" width="100%"><tr></table></span></div></table></div></div></div></div><!--[if (gte mso 9)]><![endif]--><!--[if (gte mso 9)]><table role="presentation" border="0" cellspacing="0" cellpadding="0" width="600" align="center" bgcolor="#ffffff"><tr><td class="temp-body"><![endif]--><div class="temp-body" style="background-color:#fff;border-radius:10px;max-width:600px"><div class="contained temp-fullbleed" style="max-width:600px;width:100%"><div class="region"><div><table role="presentation" style="width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px" class="aw-stack row"><tr><td style="padding:0;width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px" class="container" valign="top" width="100%"><div class="definition-parent"><span><table role="presentation" style="float:none;text-align:center;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px" class="floated-none" align="center" width="100%"><tr><td style="padding:0;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px" align="center"><a href="http://www.aweber.com" style="border-width:0;border-style:none;text-decoration:none" target="_blank" class="aw-image-link" rel="noopener noreferrer"><img alt="${eventDetails.shortInvite}" class="model" height="283" src="https://admin.zeroperks.com/${eventDetails.eventBanner.url}" style="display:block;width:600px;height:283px;border-width:0;border-style:none;line-height:100%;max-width:100%;outline-width:medium;outline-style:none;text-decoration:none;color:#333;font-size:20px;font-weight:700;border-radius:10px" width="600"></a></table></span></div></table><table role="presentation" style="width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px" class="aw-stack row"><tr><td style="padding:30px;width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px" class="container" valign="top" width="100%"><div class="definition-parent"><div class="paragraph text-element"><div style="color:#333;font-family:Helvetica,Arial,sans-serif;font-size:18px;line-height:125%;font-weight:400;text-align:left"><h4>${eventDetails.eventName}</h4><div style="color:#333;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:125%;font-weight:400;text-align:left">${eventDetails.reminderEmailContent}<div style="text-align:center"><a href="https://zeroperks.com/event/${eventDetails.url}" style="background-color:#000;font-size:15px;line-height:22px;font-family:Helvetica,Arial,sans-serif;font-weight:400;text-decoration:none;padding:12px 15px;color:#fff;border-radius:5px;display:inline-block;mso-padding-alt:0" target="_blank"><!--[if mso]><i style="letter-spacing:25px;mso-font-width:-100%;mso-text-raise:30pt"> </i><![endif]--><span style="mso-text-raise:15pt;color:#fff">View Invitation</span><!--[if mso]><i style="letter-spacing:25px;mso-font-width:-100%"> </i><![endif]--></a></div></div></div></div></table></div></div></div></div><!--[if (gte mso 9)]><![endif]--><!--[if (gte mso 9)]><table role="presentation" border="0" cellspacing="0" cellpadding="0" width="600" align="center"><tr><td class="temp-footer"><![endif]--><div class="temp-footer" style="max-width:600px"><div class="contained temp-fullbleed" style="max-width:600px;width:100%"><div class="region"><div><table role="presentation" style="width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px" class="aw-stack row"><tr><td style="padding:30px 20px;width:100%;text-size-adjust:100%;color:#333;font-family:Helvetica,Arial,sans-serif;border-collapse:collapse;border-spacing:0;border-width:0;border-style:none;font-size:18px" class="container" valign="top" width="100%"><div class="definition-parent"><div class="align-center social social--circle social--sm"></div></div><div class="definition-parent"><div class="paragraph text-element"><div style="color:#7c7c7c;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:125%;font-weight:400;text-align:left"><div style="text-align:center;color:#7c7c7c;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:125%;font-weight:400"> Krishna & Sabha </div></div></div></div></table></div></div></div></div><!--[if (gte mso 9)]><![endif]--></div></table></div></center><div></div>`
    });
    return true;
  } catch (error) {
    await sendEmail({
      from: 'emailzeroperks@gmail.com',
      to: 'mailkrishna2@gmail.com',
      subj: 'Error: Join Us for Our Exciting Baby Shower & Gender Reveal!',
      content: `Email error: ${email}`
    });
    return true;
  }
}