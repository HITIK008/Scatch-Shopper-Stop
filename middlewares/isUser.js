module.exports = function (req, res, next) {
    if (req.session.admin) {
        return res.redirect("/admin/dashboard"); // Redirect admin users
    }
    next();
};


