const express = require('express');
const app = express();
const db = require('./config/mongoose-connection');
const expressSession = require('express-session');
const flash = require('express-flash');
const cookieParser = require("cookie-parser");
const path = require('path');
const multer = require('multer');
require("dotenv").config();

// Debug: Log environment variables
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET);

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(expressSession({
  secret: process.env.SESSION_SECRET || "KEY",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));
app.use(flash());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const adminRouter = require('./routes/adminRouter');
const usersRouter = require('./routes/usersRouter');
const productsRouter = require('./routes/productRouter');
const indexRouter = require('./routes/index');
const contactRouter = require("./routes/contactRouter"); 

app.use("/admin", adminRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.use("/contact", contactRouter);
app.use("/", indexRouter);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});