var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
const config = require ('../configs/config');

var transporter = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: 'rshkpillai@gmail.com',
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
        console.log('email: ' + body.to);
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