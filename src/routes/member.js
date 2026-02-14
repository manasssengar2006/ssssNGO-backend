const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

router.post("/join", auth, async (req, res) => {
  const user = await User.findById(req.user.id);

  if (user.joined) {
    return res.status(400).json({ message: "Already a member" });
  }

  const memberId = "NGO-" + Date.now();

  user.joined = true;
  user.memberId = memberId;
  await user.save();

  res.json({
    message: "Joined NGO successfully",
    memberId,
  });
});

module.exports = router;
