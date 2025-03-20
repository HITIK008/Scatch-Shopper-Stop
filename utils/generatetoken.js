const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || "your_secret_key",
        { expiresIn: "7d" }
    );
};

module.exports = { generateToken };
