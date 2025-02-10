const mongoose = require('mongoose');

// mongoose.connect('mongodb://127.0.0.1:27017/shops');

const userSchema = mongoose.Schema({
    fullname: String,
    email: String,
    passwoed:String,
    cart:{
        type:Array,
        default:[]
    },
    isAdmin: Boolean,
    orders: {
        type:Array,
        default:[]
    },
    contact:Number,
    pic: String,




});

module.exports = mongoose.model('user',userSchema);