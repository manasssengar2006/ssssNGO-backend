const router = require("express").Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/uploadDocs");

const MembershipRequest = require("../models/MembershipRequest");
const User = require("../models/User");
const sendMail = require("../utils/sendMail");


// ================= TEST ROUTE (OPTIONAL) =================
router.get("/", (req, res) => {
  res.send("Membership API working ✅");
});


// ================= CREATE REQUEST =================
router.post(
  "/request",
  auth,
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadhaar", maxCount: 1 },
    { name: "pan", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const body = req.body;

      const request = await MembershipRequest.create({
        ...body,
        userId: req.user.id,

        // 🔥 SAFE FILE ACCESS
        photoFile: req.files?.photo?.[0]?.filename || "",
        aadhaarFile: req.files?.aadhaar?.[0]?.filename || "",
        panFile: req.files?.pan?.[0]?.filename || "",
      });

      await sendMail({
        to: process.env.MAIL_USER,
        subject: "New Membership Request",
        text: `New request from ${body.name}`,
      });

      res.json({ success: true, request });
    } catch (err) {
      console.error("REQUEST ERROR:", err);
      res.status(500).json({
        message: "Failed",
        error: err.message,
      });
    }
  }
);


// ================= SEARCH MEMBERS =================
router.get("/search", auth, async (req, res) => {
  try {
    const { city } = req.query;

    const isAdmin = req.user.role === "admin";
    const isMember = req.user.joined;

    if (!isAdmin && !isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find({ joined: true }).select(
      "_id name email memberId"
    );

    const members = await Promise.all(
      users.map(async (u) => {
        const query = {
          userId: u._id.toString(),
        };

        if (city) {
          query.city = { $regex: city, $options: "i" };
        }

        const reqData = await MembershipRequest.findOne(query);

        if (!reqData) return null;

        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          memberId: u.memberId,
          phone: reqData.phone || "",
          city: reqData.city || "",
          state: reqData.state || "",
          photoFile: reqData.photoFile || "",
        };
      })
    );

    res.json(members.filter(Boolean));
  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({ message: "Search failed" });
  }
});


// ================= GET ALL CITIES =================
router.get("/cities", auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const isMember = req.user.joined;

    if (!isAdmin && !isMember) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const cities = await MembershipRequest.distinct("city");

    res.json(cities);
  } catch (err) {
    console.error("CITIES ERROR:", err);
    res.status(500).json({
      message: "Failed to fetch cities",
    });
  }
});


module.exports = router;