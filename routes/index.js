const express = require("express");
const router = express.Router();
const productModel = require("../models/product-model"); // ✅ Use correct model name
const isloggedin = require("../middlewares/isLoggedin");
const userModel = require("../models/user-model");

// ✅ Shop Route (Fixing Product Not Defined Error)
// routes/index.js
router.get('/shop', async (req, res) => {
  try {
      const sortby = req.query.sortby || 'popular';
      let products;
      
      // ... [keep your existing sorting logic] ...
      
      res.render('shop', { 
          products, 
          sortby,
          success: req.flash('success') || [],
          error: req.flash('error') || []
      });
  } catch (err) {
      console.error(err);
      res.status(500).send('Error fetching products');
  }
});


// ✅ Home Page Route (Fix Duplicate loggedin)
router.get("/", function (req, res) {
  let error = req.flash('error');
  res.render('index', { error, loggedin: req.isAuthenticated && req.isAuthenticated() });
});

// ✅ Logout Route (Fix next is undefined)
router.get("/logout", isloggedin, function (req, res) {
  req.logout(function (err) {
    if (err) {
      console.error(err);
    }
    res.redirect("/");
  });
});

// ✅ Add to Cart Route (Fix Syntax & Logic)
router.get("/addtocart/:productid", isloggedin, async function (req, res) {
  try {
    let user = await userModel.findOne({ email: req.user.email });
    user.cart.push(req.params.productid);
    await user.save();
    req.flash('success', "Product added to cart successfully");
  } catch (err) {
    console.error(err);
    req.flash('error', "Error adding product to cart");
  }
  res.redirect("/shop");
});

// ✅ Cart Route (Fix Rendering & Calculation Errors)
router.get("/cart", isloggedin, async function (req, res) {
  try {
    let user = await userModel.findOne({ email: req.user.email }).populate("cart");

    if (!user.cart.length) {
      return res.render("cart", { user, bill: 0 });
    }

    const bill = Number(user.cart[0].price + 20 - Number(user.cart[0].discount));
    res.render("cart", { user, bill }); // ✅ Corrected rendering
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading cart");
  }
});

module.exports = router;
