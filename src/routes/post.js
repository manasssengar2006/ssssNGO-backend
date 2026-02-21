const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// CREATE POST
router.post("/", auth, admin, upload.array("images", 10), async (req, res) => {
  try {
    if (!req.files) return res.status(400).json({ error: "No images" });

    // get cloudinary URLs
    const imageUrls = req.files.map(file => file.path);

    const post = await Post.create({
      caption: req.body.caption,
      images: imageUrls,
    });

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;