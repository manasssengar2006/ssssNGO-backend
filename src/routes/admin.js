const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const fs = require("fs");
const MembershipRequest = require("../models/MembershipRequest");
const User = require("../models/User");
const Post = require("../models/Post");

const generateIdCard = require("../utils/generateIdCard");
const generateCertificate = require("../utils/generateCertificate");
const sendMail = require("../utils/sendMail");

// ================= STATS =================
router.get("/stats", auth, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const members = await User.countDocuments({ joined: true });
    const pending = await MembershipRequest.countDocuments({ status: "pending" });
    const totalPosts = await Post.countDocuments();

    res.json({
      totalUsers,
      members,
      pendingRequests: pending,
      totalPosts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Stats error" });
  }
});

// ================= GET REQUESTS =================
router.get("/requests", auth, admin, async (req, res) => {
  try {
    const requests = await MembershipRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load requests" });
  }
});

// ================= APPROVE =================
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

    // 🛑 SAFETY CHECK
    if (!user.email) {
      return res.status(400).json({ message: "User email missing" });
    }

    // generate memberId
    user.joined = true;
    user.memberId = `SVB-${Date.now()}`;
    await user.save();

    // PDF data (✅ correct source)
    const pdfUser = {
      name: request.name,
      email: user.email,
      memberId: user.memberId,
    };

    // generate PDFs
    const idCardPath = await generateIdCard(pdfUser);
    const certPath = await generateCertificate(pdfUser);

    // save paths
    user.idCardPath = idCardPath;
    user.certificatePath = certPath;
    await user.save();

    request.status = "approved";
    await request.save();

    // 🔥 FIX: convert files → buffer (IMPORTANT)
    const idCardBuffer = fs.readFileSync(idCardPath);
    const certBuffer = fs.readFileSync(certPath);

    // send email with attachments
    await sendMail({
      to: user.email,
      subject: "Your NGO Membership Approved 🎉",
      text: `Dear ${user.name}, your membership is approved.`,
      attachments: [
        {
          filename: "ID-Card.pdf",
          content: idCardBuffer, // ✅ FIXED
        },
        {
          filename: "Certificate.pdf",
          content: certBuffer, // ✅ FIXED
        },
      ],
    });

    res.json({ success: true });
  } catch (err) {
    console.error("APPROVE ERROR:", err);
    res.status(500).json({
      message: "Approval failed",
      error: err.message,
    });
  }
});

// ================= REJECT =================
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
router.get("/members", auth, admin, async (req, res) => {
  try {
    const users = await User.find({ joined: true }).select(
      "_id name email memberId createdAt"
    );

    const members = await Promise.all(
      users.map(async (u) => {
        const reqData = await MembershipRequest.findOne({
          userId: u._id.toString(),
        });

        const city =
          reqData?.city ||
          reqData?.currentAddress?.split(",")[0] ||
          "N/A";

        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          memberId: u.memberId,
          city,
          phone: reqData?.phone || "N/A",
          createdAt: u.createdAt,
        };
      })
    );

    res.json(members);
  } catch (err) {
    console.error("GET MEMBERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch members" });
  }
});
module.exports = router;
