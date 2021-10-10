const nodemailer = require('nodemailer')
const Env = require('./environment')
const ejs = require('ejs')
const path = require('path');
const { realpath } = require('fs');





let transporter = nodemailer.createTransport( {
    service:"gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'team.wetrishul@gmail.com', 
      pass: '12019009009994',
    },
  });

  let renderTemlate = (data,relativepath)=>{
      let mailHTML
      ejs.renderFile(
          path.join(__dirname,'../views/mailers',relativepath),
          data,
          function(err,template){
              if(err)
              {
                  console.log('error in rendering template'+err)
                  return;
              }
              mailHTML = template
          }
      )

      return mailHTML
  }

  module.exports = {
      transporter : transporter,
      renderTemlate : renderTemlate
  }