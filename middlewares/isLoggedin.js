const jwt = require('jsonwebtoken');
const userModel = require("../models/user-model");

module.exports = function (req, res, next) {
    if (!req.session.user) {
      req.flash("error", "You need to login first");
      return res.redirect("/users/login");
    }
    next();
  };