const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const productModel = require("../models/product-model");

// Redirect GET /products/create to /admin/create
router.get("/create", (req, res) => {
  if (!req.session.admin) {
    req.flash("error", "Admin access required");
    return res.redirect("/admin");
  }
  res.redirect("/admin/create");
});

router.post("/create", upload.single("image"), async function (req, res) {
  if (!req.session.admin) {
    req.flash("error", "Admin access required");
    return res.redirect("/admin");
  }
  try {
    const { name, price, discount, panelcolor, textcolor, bgcolor } = req.body;
    const image = req.file ? req.file.buffer : null;

    // console.log("Received data:", { name, price, discount, panelcolor, textcolor, bgcolor, image: !!image }); // Debug log

    if (!name || !price || !image || !bgcolor || !panelcolor || !textcolor) {
      req.flash("error", "All fields are required");
      return res.redirect("/admin/create");
    }

    const newProduct = await productModel.create({
      name,
      price: parseFloat(price),
      discount: parseFloat(discount) || 0,
      image,
      bgcolor,
      panelcolor,
      textcolor,
    });

    // console.log("Product saved:", newProduct); // Debug log
    req.flash("success", "Product created successfully");
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Error creating product:", error);
    req.flash("error", "Server error: " + error.message);
    res.redirect("/admin/create");
  }
});

module.exports = router;