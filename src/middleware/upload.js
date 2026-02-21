const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

// storage config
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "posts", // cloudinary folder
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage });

module.exports = upload;