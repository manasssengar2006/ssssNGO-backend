const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async ({ to, subject, text, attachments = [] }) => {
  if (!to) {
    console.error("❌ Missing 'to' email");
    return;
  }

  try {
    const response = await resend.emails.send({
      from: "admin@swabhimanshikshasanskriti.in",
      to,
      subject,
      html: `<p>${text}</p>`,
      attachments, // ✅ REQUIRED
    });

    console.log("✅ Email sent:", response);
  } catch (err) {
    console.error("❌ Email error:", err?.response?.data || err.message);
  }
};