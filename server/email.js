"use strict";
const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
<<<<<<< HEAD
async function main(reciever, header, message) {

=======
module.exports.main = async function main(reciever, header, message) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount(); 
>>>>>>> 384562cc50a1c7f97ff46db4832b93d54f54753d

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
<<<<<<< HEAD



main().catch(console.error);
=======
>>>>>>> 384562cc50a1c7f97ff46db4832b93d54f54753d
