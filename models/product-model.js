const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  bgcolor: { type: String, default: "#ffffff" },
  panelcolor: { type: String, default: "#ffffff" },
  textcolor: { type: String, default: "#000000" },
  image: { type: Buffer, required: true },
  description: { type: String, default: "No description available." },
});

module.exports = mongoose.model("product", productSchema);