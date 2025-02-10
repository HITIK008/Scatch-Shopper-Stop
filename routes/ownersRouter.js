const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const ownerModel = require("../models/owner-model");

if (process.env.NODE_ENV === "development") {
  router.post("/create", async function (req, res) {
    try {
      let owner = await ownerModel.find();
      if (owner.length > 0) {
        return res.status(400).json({ message: "Owner already exists" });
      }

      let { fullname, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      let createdOwner = await ownerModel.create({
        fullname,
        email,
        password: hashedPassword,
      });

      res.status(201).json(createdOwner);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
}

// Default route
router.get("/", function (req, res) {
  res.send("Hello, Owner!");
});

module.exports = router;
