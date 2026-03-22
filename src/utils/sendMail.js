// utils/sendMail.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async ({ to, subject, text }) => {
  try {
    console.log("Sending email:", { to, subject, text });

    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject,
      html: `<p>${text}</p>`,
    });

    console.log("✅ Email sent:", response);
  } catch (err) {
    console.error("❌ FULL ERROR:", err);
    console.error("❌ RESPONSE:", err?.response?.data);
  }
};
