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

        photoFile: req.files.photo[0].filename,
        aadhaarFile: req.files.aadhaar[0].filename,
        panFile: req.files.pan[0].filename,
      });

      await sendMail({
        to: process.env.MAIL_USER,
        subject: "New Membership Request",
        text: `
Name: ${body.name}
Father: ${body.fatherName}
Mother: ${body.motherName}
Phone: ${body.phone}
Income: ${body.annualIncome}
Source: ${body.incomeSource}
Address: ${body.currentAddress}
        `,
        attachments: [
          { path: `uploads/docs/${request.photoFile}` },
          { path: `uploads/docs/${request.aadhaarFile}` },
          { path: `uploads/docs/${request.panFile}` },
        ],
      });

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed" });
    }
  }
);

module.exports = router;
