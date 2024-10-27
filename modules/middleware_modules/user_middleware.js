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
        req.user = decoded['_doc']; // Store userId in the request object
        next();
    } catch (err) {
        res.status(401).json({ status: false, message: 'Token is not valid' });
    }
};

module.exports = {auth , addTokenToBlacklist, isTokenBlacklisted };
