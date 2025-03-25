const express = require("express");
const Letter = require("../models/letter");
const isAuthenticated = require("../middleware/authMiddleware"); // Import middleware
const router = express.Router();

// 📝 **Create a new letter**
router.post("/create", isAuthenticated, async (req, res) => {
  try {
    const { title, content } = req.body;

    const newLetter = new Letter({
      userId: req.user.id, // User ID from JWT token
      title,
      content,
    });

    await newLetter.save();
    res.status(201).json(newLetter);
  } catch (error) {
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

module.exports = router;
