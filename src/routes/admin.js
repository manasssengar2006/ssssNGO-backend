const express = require("express");
const router = express.Router();
const fs = require("fs");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const MembershipRequest = require("../models/MembershipRequest");
const User = require("../models/User");

const generateIdCard = require("../utils/generateIdCard");
const generateCertificate = require("../utils/generateCertificate");
const sendMail = require("../utils/sendMail");


// ✅ 1) GET ALL REQUESTS  ------------------------

router.get("/requests", auth, admin, async (req, res) => {
  try {
    const requests = await MembershipRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load requests" });
  }
});


// ✅ 2) APPROVE REQUEST --------------------------

router.post("/approve/:id", auth, admin, async (req, res) => {
  try {
    const request = await MembershipRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    const user = await User.findById(request.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.joined = true;
    user.memberId = `SVB-${Date.now()}`;

    const idCardPath = await generateIdCard(user);
    const certPath = await generateCertificate(user);

    user.idCardPath = idCardPath;
    user.certificatePath = certPath;
    await user.save();

    request.status = "approved";
    await request.save();

    await sendMail({
      to: user.email,
      subject: "Your NGO Membership Approved",
      text: `Dear ${user.name},

Your membership is approved.

Member ID: ${user.memberId}

ID Card & Certificate attached.`,
      attachments: [
        {
          filename: "ID-Card.pdf",
          content: fs.readFileSync(idCardPath),
          contentType: "application/pdf",
        },
        {
          filename: "Certificate.pdf",
          content: fs.readFileSync(certPath),
          contentType: "application/pdf",
        },
      ],
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Approval failed" });
  }
});


// ✅ 3) REJECT REQUEST ----------------------------

router.post("/reject/:id", auth, admin, async (req, res) => {
  try {
    const request = await MembershipRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "rejected";
    await request.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reject failed" });
  }
});


module.exports = router;
