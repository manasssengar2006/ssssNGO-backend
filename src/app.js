const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/admin");

const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ssss-ngo-frontend-he1wqeldv-manasssengar2006s-projects.vercel.app"
  ],
  credentials: true,
}));


// ================= STATIC UPLOADS =================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= ROUTES =================
app.use("/api/member", require("./routes/member"));
app.use("/api/membership", require("./routes/membership"));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/posts", require("./routes/post"));

app.get("/", (req, res) => {
  res.send("NGO API is running");
});

module.exports = app;