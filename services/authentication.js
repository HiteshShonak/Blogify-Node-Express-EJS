const JWT = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;

function createToken(user) {
    const payload = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profileImageURL: user.profileImageURL,
        role: user.role,
    };
    return JWT.sign(payload, SECRET_KEY);
}

function validateToken(token) {
    try {
        return JWT.verify(token, SECRET_KEY);
    } catch (error) {
        return null;
    }
}

module.exports = {
    createToken,
    validateToken,
};