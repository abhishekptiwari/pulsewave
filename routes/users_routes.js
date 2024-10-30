const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { adminAuth, auth, addTokenToBlacklist, isTokenBlacklisted } = require('../modules/middleware_modules/user_middleware')
// Import the User model
const User = require('../models/User');
const JWT_SECRET = "411e2bbade89dfccddecfffe723419bce69fe34179720dc64d8a28e1670ff78a";

router.post('/signup', async (req, res) => {
    const { username, fullName, mobile, gender, address, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ status: false, message: 'Passwords do not match' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: false, message: 'User already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            fullName,
            mobile,
            gender,
            address,
            email,
            user_type: "customer",
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ status: true, message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error', error });
    }
});




router.post('/signin', async (req, res) => {
    const { username, password, user_type } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user || !user.user_type) {
            return res.status(400).json({ status: false, message: 'Invalid credentials' });
        }

        // Check if user_type matches
        if (user_type !== user.user_type) {
            return res.status(400).json({ status: false, message: 'Invalid user type' });
        }

        // If user_type is admin, validate password from req.body without bcrypt
        if (user_type === 'admin') {
            if (password !== user.password) {
                return res.status(400).json({ status: false, message: 'Invalid credentials' });
            }
        } else {
            // For customers, validate password with bcrypt
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ status: false, message: 'Invalid credentials' });
            }
        }

        delete user['password'];
        const token = jwt.sign({ ...user.toObject() }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({ status: true, message: 'Sign-in successful', token });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Server error', error });
    }
});


router.get('/profile', auth, async (req, res) => {
    try {

        const user = await User.findById(req.user).select('-password'); // Exclude password field
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error', error });
    }
});

router.post('/logout', auth, (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        addTokenToBlacklist(token);
        res.status(200).json({ status: true, message: 'User logged out successfully' });

    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error', error });
    }

});

// Get all users (Admin only)
router.get('/getAllUsers', adminAuth, async (req, res) => {
    try {
    const {  user_type } = req.body;

        if(!user_type){
            return res.status(400).json({ status: false, message: 'Provide valid user type.' });
        }else{
            const users = await User.find({user_type: user_type}).select('-password'); // Exclude password from the results
            
            return res.json({ status: true, users });
        }
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error', error });
    }
});

module.exports = router;