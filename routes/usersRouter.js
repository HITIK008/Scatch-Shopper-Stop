const express = require("express");
const router = express.Router();
const productModel = require("../models/product-model");
const isloggedin = require("../middlewares/isLoggedin");
const userModel = require("../models/user-model");
const Razorpay = require("razorpay");
const { registerUser, loginUser, logout } = require("../controllers/authController");
const upload = require("../config/multer");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
console.log("Razorpay Instance Initialized with Key ID:", process.env.RAZORPAY_KEY_ID);

// User Registration Page (GET)
router.get("/register", (req, res) => {
  const error = req.flash("error") || "";
  res.render("register", { error });
});

// Handle User Registration (POST)
router.post("/register", async (req, res) => {
  try {
    let { email, password, confirmPassword, fullname } = req.body;

    // Check if email contains capital letters
    if (/[A-Z]/.test(email)) {
      return res.render("register", { error: "Email must not contain capital letters" });
    }

    // Check password format
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasUpperCase || !hasSpecialChar || !hasNumber) {
      return res.render("register", { error: "Password must contain at least one capital letter, one special character, and one number" });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.render("register", { error: "Passwords do not match" });
    }

    // Convert email to lowercase for consistency
    email = email.toLowerCase();

    let user = await userModel.findOne({ email });
    if (user) {
      return res.render("register", { error: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    user = await userModel.create({
      email,
      password: hash,
      fullname,
    });

    req.session.user = {
      email: user.email,
      id: user._id,
    };

    res.redirect("/users/shop");
  } catch (err) {
    console.error(err);
    res.render("register", { error: "An error occurred during registration" });
  }
});

// User Login Page (GET)
router.get("/login", (req, res) => {
  const error = req.flash("error") || "";
  res.render("login", { error });
});

// Handle User Login (POST) - Fixed Route
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    // Convert email to lowercase for consistency
    email = email.toLowerCase();

    // Find the user by email
    let user = await userModel.findOne({ email });
    if (!user) {
      return res.render("login", { error: "Invalid email or password" });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render("login", { error: "Invalid email or password" });
    }

    // Set the user session
    req.session.user = {
      email: user.email,
      id: user._id,
    };

    // Redirect to /users/shop without query parameters
    res.redirect("/users/shop");
  } catch (err) {
    console.error(err);
    res.render("login", { error: "An error occurred during login" });
  }
});

// [Remaining routes remain unchanged...]

router.get("/profile", isloggedin, async (req, res) => {
  try {
    // Populate the items field in the orders array
    const user = await userModel.findOne({ email: req.session.user.email }).populate("orders.items");
    console.log("User orders from DB:", user.orders);

    // Filter out invalid items in each order and ensure totals are valid
    if (user && user.orders) {
      user.orders = user.orders.map(order => {
        // Filter out items that failed to populate (i.e., product no longer exists)
        order.items = order.items.filter(item => item && item._id && typeof item.price !== "undefined");
        // Recalculate total if necessary
        if (!order.total || isNaN(order.total) || order.total === 20) { // Check if total is just the delivery fee
          order.total = order.items.reduce((sum, item) => {
            return sum + (Number(item.price) - Number(item.discount || 0));
          }, 0) + 20; // Add ₹20 for shipping or other fees
        }
        return order;
      });
    }

    const success = req.flash("success") || "";
    const error = req.flash("error") || "";
    res.render("profile", { user, success, error });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    req.flash("error", "Error loading profile");
    res.redirect("/users/shop");
  }
}); // Add ₹20 for shipping or other fees
  
// Handle User Login (POST)
router.post("/register", async (req, res) => {
  try {
    let { email, password, confirmPassword, fullname } = req.body;

    // Check if email contains capital letters
    if (/[A-Z]/.test(email)) {
      return res.render("register", { error: "Email must not contain capital letters" });
    }

    // Check password format
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasUpperCase || !hasSpecialChar || !hasNumber) {
      return res.render("register", { error: "Password must contain at least one capital letter, one special character, and one number" });
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.render("register", { error: "Passwords do not match" });
    }

    // Convert email to lowercase for consistency
    email = email.toLowerCase();

    let user = await userModel.findOne({ email });
    if (user) {
      return res.render("register", { error: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    user = await userModel.create({
      email,
      password: hash,
      fullname,
    });

    req.session.user = {
      email: user.email,
      id: user._id,
    };

    res.redirect("/users/shop");
  } catch (err) {
    console.error(err);
    res.render("register", { error: "An error occurred during registration" });
  }
});

// User Profile Page (GET)
// Handle User Profile Update (POST)
router.post("/profile/update", isloggedin, upload.single("profileImage"), async (req, res) => {
  try {
    const { fullname, email, password, phone, address } = req.body;
    const profileImage = req.file ? req.file.buffer : null;

    const user = await userModel.findOne({ email: req.session.user.email });

    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    if (profileImage) {
      user.profileImage = profileImage;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (email && email !== req.session.user.email) {
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        req.flash("error", "Email already in use");
        return res.redirect("/users/profile");
      }
    }

    await user.save();

    req.session.user.email = user.email;
    req.session.user.fullname = user.fullname;

    req.flash("success", "Profile updated successfully");
    res.redirect("/users/profile");
  } catch (err) {
    console.error("Error updating user profile:", err);
    req.flash("error", "Error updating profile: " + err.message);
    res.redirect("/users/profile");
  }
});
router.get("/product/:productId", isloggedin, async (req, res) => {
  try {
    const product = await productModel.findById(req.params.productId);
    if (!product) {
      return res.render("shop", { error: "Product not found" });
    }
    res.render("product", { product });
  } catch (err) {
    console.error(err);
    res.render("shop", { error: "Failed to load product details" });
  }
});

router.get("/shop", async (req, res) => {
  try {
    const sortby = req.query.sortby || "popular";
    const search = req.query.search || "";
    const success = req.flash("success") || "";
    const error = req.flash("error") || "";
    let products;

    // Build the query for searching
    const query = search ? { name: { $regex: search, $options: "i" } } : {};

    // Fetch products based on sort option
    if (sortby === "high-low") {
      products = await productModel.find(query).sort({ price: -1 });
    } else if (sortby === "low-high") {
      products = await productModel.find(query).sort({ price: 1 });
    } else if (sortby === "with-discount") {
      products = await productModel.find({ ...query, discount: { $gt: 0 } });
    } else if (sortby === "without-discount") {
      // Handle both discount: 0 and discount: undefined/null
      products = await productModel.find({
        ...query,
        $or: [{ discount: 0 }, { discount: { $exists: false } }, { discount: null }],
      });
    } else if (sortby === "newest") {
      products = await productModel.find(query).sort({ createdAt: -1 });
    } else {
      // Default: fetch all products
      products = await productModel.find(query);
    }

    // Log the fetched products for debugging
    console.log("Fetched products:", products.length, products.map(p => p.name));

    res.render("shop", { products, sortby, search, success, error, loggedin: req.session.user ? true : false });
  } catch (err) {
    console.error("Error fetching products for shop:", err);
    res.render("shop", { error: "Error fetching products", products: [], sortby, search, success, loggedin: req.session.user ? true : false });
  }
});


router.get("/", function (req, res) {
  let error = req.flash("error");
  res.render("index", { error, loggedin: req.session.user ? true : false });
});

router.get("/logout", isloggedin, function (req, res) {
  logout(req, res);
});

router.get("/addtocart/:productId", isloggedin, async (req, res) => {
  try {
    const productId = req.params.productId;

    // Validate productId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.error("Invalid product ID:", productId);
      req.flash("error", "Invalid product ID");
      return res.redirect("/users/shop");
    }

    // Check if the product exists
    const product = await productModel.findById(productId);
    if (!product) {
      console.error("Product not found for ID:", productId);
      req.flash("error", "Product not found");
      return res.redirect("/users/shop");
    }

    // Check if the user session is valid
    if (!req.session.user || !req.session.user.email) {
      console.error("User session not found");
      req.flash("error", "Please log in to add products to your cart");
      return res.redirect("/users/login");
    }

    // Find the user
    const user = await userModel.findOne({ email: req.session.user.email });
    if (!user) {
      console.error("User not found for email:", req.session.user.email);
      req.flash("error", "User not found. Please log in again.");
      return res.redirect("/users/login");
    }

    // Check if the product is already in the cart
    const cartItem = user.cart.find(item => item.productId.toString() === productId);
    if (cartItem) {
      // If product exists, increment the quantity
      cartItem.quantity += 1;
      console.log(`Incremented quantity for product ${productId}. New quantity: ${cartItem.quantity}`);
    } else {
      // If product doesn't exist, add it with quantity 1
      user.cart.push({ productId, quantity: 1 });
      console.log(`Added product ${productId} to cart with quantity 1`);
    }

    // Save the user with the updated cart
    await user.save();

    // Log the updated cart for debugging
    console.log("Updated user cart:", user.cart);

    req.flash("success", "Product added to cart successfully");
    res.redirect("/users/shop");
  } catch (err) {
    console.error("Error adding product to cart:", err);
    req.flash("error", "Failed to add product to cart");
    res.redirect("/users/shop");
  }
});

router.get("/cart/increase/:productId", isloggedin, async (req, res) => {
  try {
    const productId = req.params.productId;
    const user = await userModel.findOne({ email: req.session.user.email });

    const cartItem = user.cart.find(item => item.productId.toString() === productId);
    if (cartItem) {
      cartItem.quantity += 1;
      await user.save();
    }
    if (cartItem.quantity >= 10) {
      return res.render("cart", { error: "Maximum quantity reached" });
    }

    res.redirect("/users/cart");
  } catch (err) {
    console.error(err);
    res.render("cart", { error: "Failed to update quantity" });
  }
});

// Decrease Quantity Route
router.get("/cart/decrease/:productId", isloggedin, async (req, res) => {
  try {
    const productId = req.params.productId;
    const user = await userModel.findOne({ email: req.session.user.email });

    const cartItemIndex = user.cart.findIndex(item => item.productId.toString() === productId);
    if (cartItemIndex !== -1) {
      const cartItem = user.cart[cartItemIndex];
      if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
      } else {
        // If quantity is 1, remove the item from the cart
        user.cart.splice(cartItemIndex, 1);
      }
      await user.save();
    }

    res.redirect("/users/cart");
  } catch (err) {
    console.error(err);
    res.render("cart", { error: "Failed to update quantity" });
  }
});

router.get("/deletefromcart/:productid", isloggedin, async function (req, res) {
  try {
    let user = await userModel.findOne({ email: req.session.user.email });
    user.cart = user.cart.filter((item) => item.toString() !== req.params.productid);
    await user.save();
    req.flash("success", "Product removed from cart successfully");
    res.redirect("/users/cart");
  } catch (err) {
    req.flash("error", "Error removing product from cart: " + err.message);
    res.redirect("/users/cart");
  }
});

router.get("/cart", isloggedin, async function (req, res) {
  try {
    // Populate the productId field inside the cart array
    let user = await userModel.findOne({ email: req.session.user.email }).populate("cart.productId");

    const success = req.flash("success") || "";
    const error = req.flash("error") || "";

    if (!user.cart || user.cart.length === 0) {
      return res.render("cart", { products: [], cartItems: [], bill: 0, success, error });
    }

    // Filter out invalid cart items (e.g., if the product no longer exists)
    const validCartItems = user.cart.filter(item => item.productId && mongoose.Types.ObjectId.isValid(item.productId._id));
    user.cart = validCartItems;
    await user.save();

    // Extract the products and cart items for rendering
    const products = validCartItems.map(item => item.productId).filter(product => product); // Only include valid products
    const cartItems = validCartItems;

    // Calculate the bill
    const bill = cartItems.reduce((total, item) => {
      const product = item.productId;
      if (!product || typeof product.price === "undefined" || typeof product.discount === "undefined") {
        console.warn("Invalid product data:", product);
        return total;
      }
      return total + (Number(product.price) - Number(product.discount || 0)) * item.quantity;
    }, 0) + 20;

    res.render("cart", { products, cartItems, bill, success, error });
  } catch (err) {
    console.error("Error loading cart - Full stack trace:", err.stack);
    res.render("cart", { products: [], cartItems: [], bill: 0, success: "Error loading cart", error });
  }
});

router.post("/checkout", isloggedin, async function (req, res) {
  try {
    // Populate the productId field inside the cart array
    let user = await userModel.findOne({ email: req.session.user.email }).populate("cart.productId");
    console.log("User fetched for checkout:", user ? user.email : "Not found");
    console.log("User cart:", user ? user.cart : "Empty");

    if (!user) {
      throw new Error("User not found");
    }
    if (!user.cart || user.cart.length === 0) {
      req.flash("error", "Cart is empty");
      return res.redirect("/users/cart");
    }

    // Filter out invalid cart items (e.g., if the product no longer exists)
    const validCartItems = user.cart.filter(item => item.productId && mongoose.Types.ObjectId.isValid(item.productId._id));
    user.cart = validCartItems;
    await user.save();

    // Calculate the bill based on quantity
    const bill = validCartItems.reduce((total, item) => {
      const product = item.productId;
      if (!product || typeof product.price === "undefined" || typeof product.discount === "undefined") {
        console.warn("Invalid product data:", product);
        return total;
      }
      return total + (Number(product.price) - Number(product.discount || 0)) * item.quantity;
    }, 0) + 20; // Add ₹20 for shipping or other fees
    console.log("Calculated bill amount:", bill);

    if (bill <= 0) {
      throw new Error("Invalid bill amount");
    }

    // Check if the amount exceeds Razorpay's maximum limit (₹1,00,00,000 in test mode)
    const MAXIMUM_AMOUNT = 10000000; // ₹1,00,00,000 (1 crore INR)
    if (bill > MAXIMUM_AMOUNT) {
      console.log("Bill amount exceeds Razorpay's maximum limit:", bill);
      req.flash("error", `Total amount (₹${bill}) exceeds the maximum allowed amount of ₹${MAXIMUM_AMOUNT}. Please reduce your cart total.`);
      return res.redirect("/users/cart");
    }

    const shortUserId = user._id.toString().substring(0, 10);
    const shortTimestamp = Math.floor(Date.now() / 1000) % 1000000;
    const receipt = `receipt_${shortUserId}_${shortTimestamp}`;
    console.log("Creating Razorpay order with amount:", bill * 100, "currency:", "INR", "receipt:", receipt);

    // Use Promise-based Razorpay order creation
    const order = await new Promise((resolve, reject) => {
      instance.orders.create(
        {
          amount: Math.round(bill * 100), // Convert to paise
          currency: "INR",
          receipt: receipt,
        },
        (err, order) => {
          if (err) {
            console.error("Razorpay order creation failed:", err);
            reject(err);
          } else {
            console.log("Razorpay order created:", order);
            resolve(order);
          }
        }
      );
    });

    req.session.order_id = order.id;
    const success = req.flash("success") || "";
    const error = req.flash("error") || "";
    res.render("checkout", { user, bill, order, key_id: process.env.RAZORPAY_KEY_ID, success, error });
  } catch (err) {
    console.error("Error creating order:", err);
    let errorMessage = "Error creating order: " + (err.message || "Unknown error");
    if (err.error && err.error.description) {
      errorMessage = `Error creating order: ${err.error.description}`;
    }
    req.flash("error", errorMessage);
    res.redirect("/users/cart");
  }
});

router.post("/payment/verify", isloggedin, async function (req, res) {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, cvv, mobile } = req.body;
    const crypto = require("crypto");
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    console.log("Generated Signature:", generated_signature);
    console.log("Razorpay Signature:", razorpay_signature);
    console.log("Order ID:", razorpay_order_id);
    console.log("Payment ID:", razorpay_payment_id);

    if (generated_signature !== razorpay_signature) {
      req.flash("error", "Payment verification failed");
      return res.redirect("/users/cart");
    }

    if (!cvv || !mobile || cvv.length !== 3 || !/^\d{10}$/.test(mobile)) {
      req.flash("error", "Invalid CVV or mobile number");
      return res.redirect("/users/cart");
    }

    // Populate the productId field in the cart
    let user = await userModel.findOne({ email: req.session.user.email }).populate("cart.productId");

    // Filter out invalid cart items
    const validCartItems = user.cart.filter(item => item.productId && mongoose.Types.ObjectId.isValid(item.productId._id));
    user.cart = validCartItems;
    await user.save();

    if (!validCartItems.length) {
      req.flash("error", "Cart is empty or contains invalid items");
      return res.redirect("/users/cart");
    }

    // Calculate the total based on valid cart items
    const total = validCartItems.reduce((sum, item) => {
      const product = item.productId;
      if (!product || typeof product.price === "undefined") {
        console.warn("Invalid product data in cart:", product);
        return sum;
      }
      return sum + (Number(product.price) - Number(product.discount || 0)) * item.quantity;
    }, 0) + 20; // Add ₹20 for shipping

    const order = {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      items: validCartItems.map(item => item.productId._id), // Use productId._id
      total: total,
      date: new Date(),
    };
    console.log("Order to save:", order);

    user.orders.push(order);
    user.cart = []; // Clear the cart after successful payment
    await user.save();
    console.log("User after save:", user);

    const invoicePath = await generateInvoice(user, order);

    req.flash("success", "Payment successful! Order placed.");
    res.redirect("/users/shop");
  } catch (err) {
    console.error("Error verifying payment:", err);
    req.flash("error", "Error verifying payment: " + (err.message || "Unknown error"));
    res.redirect("/users/cart");
  }
});
// New route to serve the invoice PDF
router.get("/invoice/:orderId", isloggedin, async (req, res) => {
  const user = await userModel.findOne({ email: req.session.user.email });
  const order = user.orders.find(o => o.order_id === req.params.orderId);

  if (!order) {
    return res.status(404).send("Invoice not found");
  }

  const invoicePath = `invoices/invoice_${req.params.orderId}.pdf`;
  res.download(invoicePath, `invoice_${req.params.orderId}.pdf`, (err) => {
    if (err) {
      console.error("Error downloading invoice:", err);
      res.status(500).send("Error downloading invoice");
    }
  });
});

// Function to generate invoice PDF
async function generateInvoice(user, order) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const invoicePath = `invoices/invoice_${order.order_id}.pdf`;
  const stream = fs.createWriteStream(invoicePath);

  doc.pipe(stream);

  // Header
  doc.fontSize(20).text("Invoice", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Invoice #${order.order_id}`, { align: "right" });
  doc.text(`Date: ${order.date.toLocaleDateString()}`, { align: "right" });
  doc.moveDown(1);

  // Customer Info
  doc.fontSize(12).text("Bill To:", { underline: true });
  doc.fontSize(10).text(`Name: ${user.fullname}`);
  doc.text(`Email: ${user.email}`);
  doc.text(`Address: ${user.address || "Not provided"}`);
  doc.moveDown(1);

  // Items Table Header
  doc.fontSize(12).text("Order Details:", { underline: true });
  doc.moveDown(0.5);
  const tableTop = doc.y;
  const itemWidth = 200;
  const priceWidth = 80;
  const qtyWidth = 50;
  const totalWidth = 100;

  doc.fontSize(10).font("Helvetica-Bold");
  doc.text("Item", 50, tableTop, { width: itemWidth });
  doc.text("Price", 250, tableTop, { width: priceWidth, align: "right" });
  doc.text("Qty", 330, tableTop, { width: qtyWidth, align: "right" });
  doc.text("Total", 380, tableTop, { width: totalWidth, align: "right" });

  // Table Line
  doc.moveTo(50, tableTop + 15).lineTo(480, tableTop + 15).stroke();
  doc.font("Helvetica");

  // Fetch Items
  const items = await productModel.find({ _id: { $in: order.items } });
  let position = tableTop + 25;
  let subtotal = 0;

  items.forEach((item, index) => {
    const itemPrice = Number(item.price) - Number(item.discount || 0);
    const quantity = order.items.length > index ? 1 : 1; // Assuming 1 if qty not tracked
    const itemTotal = itemPrice * quantity;
    subtotal += itemTotal;

    doc.text(item.name.substring(0, 30), 50, position, { width: itemWidth });
    doc.text(`₹${itemPrice.toFixed(2)}`, 250, position, { width: priceWidth, align: "right" });
    doc.text(quantity.toString(), 330, position, { width: qtyWidth, align: "right" });
    doc.text(`₹${itemTotal.toFixed(2)}`, 380, position, { width: totalWidth, align: "right" });
    position += 20;
  });

  // Delivery Charge
  const deliveryCharge = 20;
  doc.text("Delivery Charge", 50, position);
  doc.text(`₹${deliveryCharge.toFixed(2)}`, 380, position, { width: totalWidth, align: "right" });
  position += 20;

  // Total
  doc.moveTo(50, position - 10).lineTo(480, position - 10).stroke();
  doc.font("Helvetica-Bold");
  doc.text("Total Amount", 50, position);
  doc.text(`₹${(subtotal + deliveryCharge).toFixed(2)}`, 380, position, { width: totalWidth, align: "right" });

  doc.end();
  return new Promise((resolve) => stream.on("finish", () => resolve(invoicePath)));
}

// Other routes remain unchanged...
router.get("/about", (req, res) => {
  const success = req.flash("success") || "";
  const error = req.flash("error") || "";
  res.render("about", { success, error, loggedin: req.session.user ? true : false });
});

router.get("/contact", (req, res) => {
  const success = req.flash("success") || "";
  const error = req.flash("error") || "";
  res.render("contact", { success, error, loggedin: req.session.user ? true : false });
});

module.exports = router;