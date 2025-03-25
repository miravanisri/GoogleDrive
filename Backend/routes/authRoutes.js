const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Google OAuth login route
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google OAuth callback route
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:5173/login" }),
  (req, res) => {
    const token = req.user.token;
    
    // Send token as a cookie or in response
    res.cookie("token", token, { httpOnly: true, secure: false }); // Secure should be true in production
    res.redirect(`http://localhost:5173?token=${token}`);
  }
);

// Logout route
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.clearCookie("token");
    res.redirect("http://localhost:5173");
  });
});

module.exports = router;
