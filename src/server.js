const path = require("path");

// 🔥 FORCE LOAD .env (absolute path)
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

console.log("ENV CHECK:", process.env.MONGO_URI); // debug

const app = require("./app");
const connectDB = require("./config/db");

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("server is running in " + PORT);
});
