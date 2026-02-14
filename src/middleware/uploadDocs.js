const multer = require("multer");

const storage = multer.diskStorage({
  destination: "uploads/docs",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

module.exports = multer({ storage });
