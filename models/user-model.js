const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  cart: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  orders: [
    {
      order_id: String,
      items: [mongoose.Schema.Types.ObjectId],
      amount: Number,
      date: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        default: "pending",
      },
    },
  ],
});

module.exports = mongoose.model("user", userSchema);