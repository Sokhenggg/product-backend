require("dotenv").config();
const nodemailer = require("nodemailer");

// Create new transporter for sending email
const transporter = () => {
   try {
      return nodemailer.createTransport({
         host: "smtp.gmail.com",
         port: 587,
         secure: false,
         auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
         },
      });
   } catch (err) {
      console.log(err);
   }
};

module.exports = transporter;
