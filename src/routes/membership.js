const router = require("express").Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/uploadDocs");
const MembershipRequest = require("../models/MembershipRequest");
const sendMail = require("../utils/sendMail");

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

        // SAFE FILE ACCESS
        photoFile: req.files?.photo?.[0]?.filename,
        aadhaarFile: req.files?.aadhaar?.[0]?.filename,
        panFile: req.files?.pan?.[0]?.filename,
      });

      // notify admin
      await sendMail({
        to: process.env.MAIL_USER,
        subject: "New Membership Request",
        text: `New request from ${body.name}`,
      });

      res.json({ success: true });
    } catch (err) {
      console.error("REQUEST ERROR:", err);
      res.status(500).json({
        message: "Failed",
        error: err.message,
      });
    }
  }
);

module.exports = router;
