const mongoose = require('mongoose');

// mongoose.connect('mongodb://127.0.0.1:27017/shops');

const productSchema = mongoose.Schema({
    image:String,
    name: String,
    price: Number,
    discount: Number,
    // description: String,
    // category: String,
    bgcolor:String,
    textcolor:String,
    pannalcolor:String,
    stock: Number,



});

module.exports = mongoose.model('product',productSchema);