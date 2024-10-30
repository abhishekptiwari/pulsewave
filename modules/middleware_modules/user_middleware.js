// middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = "411e2bbade89dfccddecfffe723419bce69fe34179720dc64d8a28e1670ff78a";


const blacklist = new Set();

const addTokenToBlacklist = (token) => {
    blacklist.add(token);
};

const isTokenBlacklisted = (token) => {
    return blacklist.has(token);
};
const auth = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');


    if (!token || isTokenBlacklisted(token)) {
        return res.status(401).json({ status: false, message: 'Unauthorized access' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Store userId in the request object
        next();
    } catch (err) {
        res.status(401).json({ status: false, message: 'Token is not valid' });
    }
};

const adminAuth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ status: false, message: 'Authorization denied. No token provided.' });
    }

    // Check if the token is blacklisted
    if (isTokenBlacklisted(token)) {
        return res.status(403).json({ status: false, message: 'Token is blacklisted. Please sign in again.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Ensure the user is an admin
        if (decoded.user_type !== 'admin') {
            return res.status(403).json({ status: false, message: 'Access denied. Admins only.' });
        }

        req.user = decoded; // Attach decoded user info to the request
        next();
    } catch (err) {
        res.status(401).json({ status: false, message: 'Invalid token' });
    }
};

module.exports = {auth , adminAuth, addTokenToBlacklist, isTokenBlacklisted };
