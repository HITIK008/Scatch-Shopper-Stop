module.exports = function (req, res, next) {
    if (!req.session.admin) {
        return res.redirect('/admin'); // Redirect to admin login if not logged in
    }
    next();
};
