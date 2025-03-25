require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();

require("./config/passport"); // Import passport config
require("./config/db"); // Import DB connection
const letterRoutes = require("./routes/letterRoutes");
const app = express();

// Middleware
app.use(express.json());
app.use("/letters", letterRoutes); // Register letter routes
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
