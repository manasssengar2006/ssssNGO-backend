const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const upload = require("../middleware/upload");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const cloudinary = require("cloudinary").v2;

// ================= GET ALL POSTS =================
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= GET SINGLE POST =================
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= CREATE POST =================
router.post("/", auth, admin, upload.array("images", 10), async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const imageUrls = req.files.map(file => file.path);

    const post = await Post.create({
      user: req.user.id,
      caption: req.body.caption || "",
      images: imageUrls,
    });

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= UPDATE POST =================
router.put("/:id", auth, admin, upload.array("images", 10), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.caption = req.body.caption || post.caption;

    // Replace images if new uploaded
    if (req.files && req.files.length > 0) {
      // delete old images
      for (let img of post.images) {
        const publicId = img.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }

      post.images = req.files.map(file => file.path);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ================= DELETE POST =================
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // delete images from cloudinary
    for (let img of post.images) {
      const publicId = img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await post.deleteOne();

    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= LIKE =================
router.post("/:id/like", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  const userId = req.user.id;

  const index = post.likes.indexOf(userId);
  if (index === -1) post.likes.push(userId);
  else post.likes.splice(index, 1);

  await post.save();
  res.json(post.likes);
});

// ================= COMMENT =================
router.post("/:id/comment", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);

  const comment = {
    userId: req.user.id,
    userName: req.user.name,
    text: req.body.text,
  };

  post.comments.push(comment);
  await post.save();

  res.json(post.comments);
});

module.exports = router;