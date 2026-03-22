// utils/sendMail.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async ({ to, subject, text }) => {
  if (!to) {
    console.error("❌ Missing 'to' email");
    return;
  }

  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
      to,
      subject: subject || "No Subject",
      html: `<p>${text || "No content"}</p>`,
    });

    console.log("✅ Email sent:", response);
  } catch (err) {
    console.error("❌ Error:", err?.response?.data || err.message);
  }
};
