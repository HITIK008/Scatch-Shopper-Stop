const userModel = require("../models/user-model");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/generatetoken");

// Hardcoded Admin Credentials
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin";

// Register User (Users Only)
module.exports.registerUser = async function (req, res) {
    try {
      const { email, password, fullname } = req.body;
  
      // console.log("Register attempt - Request body:", { email, fullname, password }); // Detailed debug log
  
      if (!email || !password || !fullname) {
        req.flash("error", "All fields are required");
        return res.redirect("/users/register");
      }
  
      // Prevent Admin Registration
      if (email === ADMIN_EMAIL) {
        req.flash("error", "Admin cannot register as a user");
        return res.redirect("/users/register");
      }
  
      // Check if the email is already registered
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        req.flash("error", "Email already exists");
        return res.redirect("/users/register");
      }
  
      // Hash Password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      // console.log("Password hashed successfully"); // Debug log
  
      // Create User
      const newUser = await userModel.create({
        email,
        password: hashedPassword,
        fullname,
      });
      // console.log("User created successfully:", newUser); // Debug log
  
      // Generate Token
      const token = generateToken(newUser);
      // console.log("Token generated:", token); // Debug log
  
      // Set Token in Cookie
      res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "Strict" });
      // console.log("Cookie set with token");  // Debug log
  
      // Store user in session
      req.session.user = { email: newUser.email, fullname: newUser.fullname };
      // console.log("Session user set:", req.session.user); // Debug log
  
      req.flash("success", "Registration successful");
      res.redirect("/users/shop");
    } catch (error) {
      console.error("Registration error - Full stack trace:", error.stack); // Detailed error log
      req.flash("error", "Internal server error: " + error.message);
      res.redirect("/users/register");
    }
  };

// Login User (Users Only)
module.exports.loginUser = async function (req, res) {
  try {
    const { email, password } = req.body;

    // console.log("Login attempt:", { email }); // Debug log

    if (!email || !password) {
      req.flash("error", "Email and password are required");
      return res.redirect("/users/login");
    }

    // Prevent Admins from logging in as Users
    if (email === ADMIN_EMAIL) {
      req.flash("error", "Admin cannot log in as a user");
      return res.redirect("/users/login");
    }

    // Find User
    const user = await userModel.findOne({ email });
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/users/login");
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("error", "Incorrect password");
      return res.redirect("/users/login");
    }

    // Generate Token
    const token = generateToken(user);

    // Set Token in Cookie
    res.cookie("token", token, { httpOnly: true, secure: false, sameSite: "Strict" });

    // Store user in session
    req.session.user = { email: user.email, fullname: user.fullname };

    req.flash("success", "Login successful");
    res.redirect("/users/shop");
  } catch (error) {
    console.error("Login error:", error);
    req.flash("error", "Internal server error");
    res.redirect("/users/login");
  }
};

// Login Admin (Only Hardcoded Admin)
module.exports.loginAdmin = async function (req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      req.flash("error", "Email and password are required");
      return res.redirect("/admin");
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      req.flash("error", "Admin not found");
      return res.redirect("/admin");
    }

    const token = generateToken({ email: ADMIN_EMAIL, role: "admin" });

    res.cookie("admin_token", token, { httpOnly: true, secure: false, sameSite: "Strict" });

    req.session.admin = { email: ADMIN_EMAIL };
    req.flash("success", "Admin login successful");
    res.redirect("/admin/create");
  } catch (error) {
    console.error("Admin login error:", error);
    req.flash("error", "Internal server error");
    return res.redirect("/admin");
  }
};

// Logout User
module.exports.logout = function (req, res) {
  req.session.user = null;
  res.cookie("token", "", { expires: new Date(0), httpOnly: true, secure: false, sameSite: "Strict" });
  req.flash("success", "Logged out successfully");
  res.redirect("/");
};

// Logout Admin
module.exports.logoutAdmin = function (req, res) {
  req.session.admin = null;
  res.cookie("admin_token", "", { expires: new Date(0), httpOnly: true, secure: false, sameSite: "Strict" });
  req.flash("success", "Admin logged out successfully");
  res.redirect("/admin");
};