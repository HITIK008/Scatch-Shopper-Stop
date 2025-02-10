const mongoose = require('mongoose');
const dbgr = require('debug')('development:mongoose');
const config = require('config');


//environment value upper depend
mongoose
.connect(`${config.get("MONGODB_URI")}`)
.then(function(){
    dbgr("Connected to MongoDB");
})
.catch(function(err){
    dbgr("Could not connect to MongoDB",err);
});

module.exports = mongoose.connection;