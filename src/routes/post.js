const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// ================= GET POSTS =================
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("FETCH POSTS ERROR:", err);
    res.status(500).json({
      message: err.message,
    });
  }
});

// ================= CREATE POST =================
router.post("/", auth, admin, upload.array("images", 10), async (req, res) => {
  try {
    console.log("FILES:", req.files);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    // Ensure Cloudinary worked
    const imageUrls = req.files
      .map(file => file.path)
      .filter(Boolean);

    if (imageUrls.length === 0) {
      return res.status(500).json({
        message: "Image upload failed (Cloudinary issue)",
      });
    }

    const post = await Post.create({
      caption: req.body.caption || "",
      images: imageUrls,
    });

    res.json(post);
  } catch (err) {
    console.error("UPLOAD CRASH FULL:", err);

    res.status(500).json({
      message: err.message,
      stack: err.stack,
    });
  }
});
// ================= GET SINGLE POST =================
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error("GET POST ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});
router.post("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.user.id;

    const index = post.likes.indexOf(userId);

    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error("LIKE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});
// ================= ADD COMMENT =================
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    const comment = {
      userId: req.user.id,
      userName: req.body.userName,
      text: req.body.text,
    };

    post.comments.push(comment);
    await post.save();

    res.json(post.comments);
  } catch (err) {
    console.error("COMMENT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;