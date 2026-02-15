const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // Gmail App Password
  },
});

module.exports = async ({ to, subject, text, attachments = [] }) => {
  await transporter.sendMail({
    from: `"NGO Team" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
    attachments,
  });
};
