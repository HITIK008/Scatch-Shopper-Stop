const mongoose = require('mongoose');

// mongoose.connect('mongodb://127.0.0.1:27017/shops');

const ownerSchema = mongoose.Schema({
    fullname:{
        type:String,
        minLength:3,
        trim:true,
    },
    email: String,
    passwoed:String,
    products: String,
    contact:Number,
    pic: String,
    gstno: Number,




});

module.exports = mongoose.model('owner',ownerSchema);