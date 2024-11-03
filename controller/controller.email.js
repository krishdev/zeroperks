var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
const config = require ('../configs/config');
const logger = require('../configs/logger');

var transporter = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: 'emailzeroperks@gmail.com',
    pass: config.gmail
  }
}));

exports.sendEmail = async function (body) {
    try {
        var mailOptions = {
            from: body.from,
            to: body.to,
            subject: body.subj,
            html: body.content,
            cc: body.cc || ''
          };
          
        const isEmailSent = await sendMail(mailOptions);
        return isEmailSent;
    } catch (error) {
        console.log(error);
        console.log('email..........: ' + body.to);
        logger.info("email missed: " + body.to);
        logger.error(error);
    }
}

function sendMail (mailOptions) {
    return new Promise ((resolve, reject) => {
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              reject(error);
            } else {
              resolve(info.response);
            }
          });
    })
}