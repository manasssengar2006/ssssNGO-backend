const MembershipRequest = require("../models/MembershipRequest");
const User = require("../models/User");

const generateIdCard = require("../utils/generateIdCard");
const generateCertificate = require("../utils/generateCertificate");
const sendMail = require("../utils/sendMail");

exports.approveMember = async (req, res) => {
  try {
    console.log("Approve:", req.params.id);

    // 1️⃣ Get request
    const request = await MembershipRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    console.log("Request found:", request.name);

    // 2️⃣ Get user
    const user = await User.findById(request.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User found:", user.email);

    // 3️⃣ Generate memberId
    const memberId = "NGO" + Date.now();

    // 4️⃣ Update request
    request.status = "approved";
    await request.save();

    // 5️⃣ Update user
    user.joined = true;
    user.memberId = memberId;
    await user.save();

    console.log("User + Request updated");

    // 6️⃣ Generate PDFs using REQUEST DATA
    const pdfUser = {
      name: request.name,
      email: request.email,
      memberId,
    };

    console.log("Generating ID...");
    const idCard = await generateIdCard(pdfUser);

    console.log("Generating Certificate...");
    const certificate = await generateCertificate(pdfUser);

    // 7️⃣ Send mail
    console.log("Sending mail...");
    await sendMail({
      to: request.email,
      subject: "NGO Membership Approved 🎉",
      text: `Hello ${request.name}, your membership is approved.`,
      attachments: [
        { filename: "id-card.pdf", path: idCard },
        { filename: "certificate.pdf", path: certificate },
      ],
    });

    console.log("Done ✅");

    res.json({ success: true });
  } catch (err) {
    console.error("APPROVE ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
