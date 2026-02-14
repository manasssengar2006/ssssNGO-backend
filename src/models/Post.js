const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userName: String,
    text: String,
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    image: String,
    caption: String,

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default:[],
      },
    ],

    comments: [commentSchema],
    default:[],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
