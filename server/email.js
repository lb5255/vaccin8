"use strict";
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
async function main(reciever, header, message) {


  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", //Email host
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "vaccin8system@outlook.com", // username
      pass: "DSecZHtMJg7nTKP",  //password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Vaccin8" <vaccin8system@outlook.com>', // sender address
    to: reciever, // list of receivers
    subject: header, // Subject line
    text: message, // plain text body
    html: "<p>" + message + "</p>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

}



main().catch(console.error);