const express = require("express");
const router = express.Router();
const Contact = require("../models/contact-model");

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    await Contact.create({ name, email, message });

    res.json({ success: true, message: "Your message has been sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
});

module.exports = router;
