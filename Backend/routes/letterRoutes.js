const express = require("express");
const Letter = require("../models/letter");
const isAuthenticated = require("../middleware/authMiddleware"); // Import middleware
const router = express.Router();
const { uploadToDrive } = require("../services/googleDrive");
const User = require("../models/User");
const { default: mongoose } = require("mongoose");

// 📝 **Create a new letter**
router.post("/create", isAuthenticated, async (req, res) => {
  console.log("User before try block:", req.user); // Debugging outside try
  try {
    console.log("User inside try block:", req.user); // Debugging inside try
    if (!req.user || !req.user.id) {
      return res.status(400).json({ error: "User authentication failed" });
    }

    const { title, content } = req.body;
    const newLetter = new Letter({
      userId: req.user.id, // User ID from JWT token
      title,
      content,
    });

    await newLetter.save();
    res.status(201).json(newLetter);
  } catch (error) {
    console.error("Error creating letter:", error); // Log actual error
    res.status(500).json({ error: "Error creating letter" });
  }
});


// 📜 **Fetch all letters for the authenticated user**
router.get("/my-letters", isAuthenticated, async (req, res) => {
  try {
    const userLetters = await Letter.find({ userId: req.user.id });
    res.status(200).json(userLetters);
  } catch (error) {
    res.status(500).json({ error: "Error fetching letters" });
  }
});

// 📝 **Update a letter**
router.put("/update/:id", isAuthenticated, async (req, res) => {
  try {
    const { title, content } = req.body;
    const updatedLetter = await Letter.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id }, // Ensure the letter belongs to the user
      { title, content },
      { new: true }
    );

    if (!updatedLetter) {
      return res.status(404).json({ error: "Letter not found" });
    }

    res.status(200).json(updatedLetter);
  } catch (error) {
    res.status(500).json({ error: "Error updating letter" });
  }
});

// ❌ **Delete a letter**
router.delete("/delete/:id", isAuthenticated, async (req, res) => {
  try {
    const deletedLetter = await Letter.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deletedLetter) {
      return res.status(404).json({ error: "Letter not found" });
    }

    res.status(200).json({ message: "Letter deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting letter" });
  }
});

router.post("/save-to-drive",isAuthenticated, async (req, res) => {
  try {
// let authToken=req.headers.authorization?.split(" ")[1];
    const { title, content } = req.body;

    if (  !title || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const userId = req.user.id;
    // console.log("Is userId an ObjectId?", mongoose.Types.ObjectId.isValid(req.user.id));
    // console.log("user id",`ObjectId(`,this.toString(userId),`)`)
    // const validUserId =new  mongoose.Types.ObjectId(userId);
    // console.log("valid id",validUserId)
    // console.log("Is userId an ObjectId?", mongoose.Types.ObjectId.isValid(req.user.id));
    const allUsers = await User.find();
    console.log("All Users:", allUsers);
    const validUserId = new mongoose.Types.ObjectId(userId.toString());
    console.log("Valid User ID:", validUserId);
    const user = await User.find({ _id: validUserId });
    console.log(user);
    console.log("access",user[0].googleAccessToken)
    if (!user || !user[0].googleAccessToken) {
      return res.status(401).json({ error: "Google authentication required" });
    }
 

    const googleAccessToken = user[0].googleAccessToken;
    const fileId = await uploadToDrive(googleAccessToken, title, content);

    res.status(200).json({ message: "File uploaded successfully", fileId });
  } catch (error) {
    res.status(500).json({ error: "Failed to upload file to Google Drive" });
  }
});


module.exports = router;
