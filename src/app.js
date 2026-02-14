const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/admin");



const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://your-frontend.vercel.app"
  ],
  credentials: true,
}));
app.use("/api/member", require("./routes/member"));
app.use("/api/membership", require("./routes/membership"));
app.use("/api/auth", authRoutes);
app.use("/api/admin", require("./routes/admin"));
app.use("/uploads", express.static("src/uploads"));
app.use("/api/posts", require("./routes/post"));
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/uploads", express.static("uploads"));


app.get("/", (req, res) => {
  res.send("NGO API is running");
});

module.exports = app;
