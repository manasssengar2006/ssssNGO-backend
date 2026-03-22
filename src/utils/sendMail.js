// utils/sendMail.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async ({ to, subject, text, attachments = [] }) => {
  try {
    await resend.emails.send({
      from: "NGO Team <onboarding@resend.dev>",
      to,
      subject,
      html: `<p>${text}</p>`,
      attachments,
    });

    console.log("✅ Email sent");
  } catch (err) {
    console.error("❌ Email error:", err);
  }
};