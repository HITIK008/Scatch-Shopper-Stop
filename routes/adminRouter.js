const express = require("express");
const router = express.Router();
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Admin login page
router.get("/", (req, res) => {
  const error = req.flash("error") || "";
  res.render("adminlogin", { error });
});

// Admin login logic with hardcoded credentials
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash("error", "Email and password are required");
      return res.redirect("/admin");
    }

    if (email.toLowerCase() !== "admin@gmail.com" || password !== "admin") {
      req.flash("error", "Invalid email or password");
      return res.redirect("/admin");
    }

    req.session.admin = { email: "admin@gmail.com" };
    req.flash("success", "Admin logged in successfully");
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong");
    res.redirect("/admin");
  }
});

// Admin dashboard with all products
router.get("/dashboard", async (req, res) => {
  if (!req.session.admin) {
    return res.redirect("/admin");
  }
  const success = req.flash("success") || "";
  try {
    const products = await productModel.find();
    res.render("admindashboard", { admin: req.session.admin, success, products });
  } catch (err) {
    console.error("Error fetching products:", err);
    req.flash("error", "Error fetching products");
    res.redirect("/admin");
  }
});
// In adminrouter.js
router.get("/orders", async (req, res) => {
  try {
    const search = req.query.search || "";
    let users;

    // Build the query for searching by email
    const query = search ? { email: { $regex: search, $options: "i" } } : {};

    // Fetch users and populate their orders.items
    users = await userModel.find(query).populate("orders.items");
    console.log("Users with orders:", users);

    // Process each user's orders to ensure totals are valid
    const processedUsers = users.map(user => {
      if (user.orders && user.orders.length > 0) {
        user.orders = user.orders.map(order => {
          // Filter out invalid items
          order.items = order.items.filter(item => item && item._id && typeof item.price !== "undefined");
          // Recalculate total if necessary
          if (!order.total || isNaN(order.total)) {
            order.total = order.items.reduce((sum, item) => {
              return sum + (Number(item.price) - Number(item.discount || 0));
            }, 0) + 20; // Add ₹20 for shipping
          }
          return order;
        });
      }
      return user;
    });

    res.render("orders", { users: processedUsers, search });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.render("orders", { users: [], search: "", error: "Error fetching orders" });
  }
});

// Admin logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin");
  });
});

// Render createproducts page
router.get("/create", (req, res) => {
  if (!req.session.admin) {
    return res.redirect("/admin");
  }
  const success = req.flash("success") || "";
  res.render("createproducts", { success });
});

// Delete all products
router.get("/delete-all", async (req, res) => {
  if (!req.session.admin) {
    req.flash("error", "Admin access required");
    return res.redirect("/admin");
  }
  try {
    await productModel.deleteMany({});
    req.flash("success", "All products deleted successfully");
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Error deleting all products:", err);
    req.flash("error", "Error deleting products: " + err.message);
    res.redirect("/admin/dashboard");
  }
});

// Delete a single product
router.get("/delete/:productId", async (req, res) => {
  if (!req.session.admin) {
    req.flash("error", "Admin access required");
    return res.redirect("/admin");
  }
  try {
    await productModel.findByIdAndDelete(req.params.productId);
    req.flash("success", "Product deleted successfully");
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Error deleting product:", err);
    req.flash("error", "Error deleting product: " + err.message);
    res.redirect("/admin/dashboard");
  }
});

router.get("/orders/invoice/:orderId", async (req, res) => {
  if (!req.session.admin) {
    return res.redirect("/admin");
  }
  try {
    const users = await userModel.find().populate("orders.items");
    let order, user;
    for (let u of users) {
      order = u.orders.find((o) => o.order_id === req.params.orderId);
      if (order) {
        user = u;
        break;
      }
    }
    if (!order) {
      return res.status(404).send("Order not found");
    }

    const invoicePath = `invoices/invoice_${req.params.orderId}.pdf`;
    if (!fs.existsSync(invoicePath)) {
      await generateInvoice(user, order);
    }
    res.download(invoicePath, `invoice_${req.params.orderId}.pdf`, (err) => {
      if (err) {
        console.error("Error downloading invoice:", err);
        res.status(500).send("Error downloading invoice");
      }
    });
  } catch (err) {
    console.error("Error generating invoice:", err);
    req.flash("error", "Error generating invoice");
    res.redirect("/admin/orders");
  }
});

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

// Admin profile page
router.get("/adminprofile", (req, res) => {
  if (!req.session.admin) {
    return res.redirect("/admin");
  }
  const success = req.flash("success") || "";
  res.render("adminprofile", { admin: req.session.admin, success });
});

module.exports = router;