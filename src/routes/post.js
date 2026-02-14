const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const upload = require("../middleware/upload");

// GET ALL POSTS
router.get("/", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// GET SINGLE POST
router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.json(post);
});

// CREATE POST (ADMIN)
router.post("/", auth, admin, upload.single("image"), async (req, res) => {
  const post = await Post.create({
    caption: req.body.caption,
    image: req.file.filename,
  });
  res.json(post);
});

// UPDATE POST (ADMIN)
router.put("/:id", auth, admin, upload.single("image"), async (req, res) => {
  const update = { caption: req.body.caption };

  if (req.file) {
    update.image = req.file.filename;
  }

  const post = await Post.findByIdAndUpdate(req.params.id, update, {
    new: true,
  });

  res.json(post);
});

// DELETE POST (ADMIN)
router.delete("/:id", auth, admin, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ message: "Post deleted" });
});

// LIKE / UNLIKE
router.post("/:id/like", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  const index = post.likes.indexOf(req.user.id);

  if (index === -1) post.likes.push(req.user.id);
  else post.likes.splice(index, 1);

  await post.save();
  res.json(post.likes);
});

// COMMENT
router.post("/:id/comment", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);

  post.comments.push({
    userId: req.user.id,
    userName: req.body.userName,
    text: req.body.text,
  });

  await post.save();
  res.json(post.comments);
});

module.exports = router;
