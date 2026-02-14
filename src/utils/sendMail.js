const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendMail = async ({
  to,
  subject,
  text,
  attachments = [],
}) => {
  await transporter.sendMail({
    from: `"NGO Team" <${process.env.MAIL_USER}>`,
    to,
    subject,
    text,
    attachments,
  });
};

module.exports = sendMail;
