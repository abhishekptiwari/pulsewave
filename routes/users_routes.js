const express = require("express");
const router = express.Router();
const bcrypt = require('bcryptjs');
const Beneficiary = require('../models/Beneficiary');

const jwt = require('jsonwebtoken');
const Balance = require('../models/Balance');
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
        const token = jwt.sign({ ...user.toObject() }, JWT_SECRET, { expiresIn: '168h' });
        return res.json({ status: true, message: 'Sign-in successful', token });
    } catch (error) {
        return res.status(500).json({ status: false, message: 'Server error', error });
    }
});




router.get('/profile', auth, async (req, res) => {
    try {
        // Fetch user details, excluding the password field
        const user = await User.findById(req.user).select('-password');
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        // Fetch account balance
        const balanceInfo = await Balance.findOne({ user_id: req.user._id });
        const fromUser = await Beneficiary.findOne({ user_id: req.user._id });

        res.json({
            status: true,
            user: {
                name: user.name,
                email: user.email,
                ifsc_code: fromUser ? fromUser.ifsc_code : null,
                account_number: fromUser ? fromUser.account_number : null, // Assuming account_number is in the User schema
                balance: balanceInfo ? balanceInfo.balance : 0, // Default to 0 if no balance record exists
            },
        });
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
        const { user_type } = req.body;

        if (!user_type) {
            return res.status(400).json({ status: false, message: 'Provide valid user type.' });
        } else {
            const users = await User.find({ user_type: user_type }).select('-password'); // Exclude password from the results

            return res.json({ status: true, users });
        }
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error', error });
    }
});


router.post('/changePassword', auth, async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const user_id = req.user._id;  // Assuming user is authenticated and user ID is available from the JWT token

    try {
        // Validate if new password and confirm password match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ status: false, message: 'New password and confirm password do not match' });
        }

        // Find the user from the database
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        // Check if current password matches
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: false, message: 'Current password is incorrect' });
        }

        // Hash the new password before saving it
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        user.password = hashedPassword;
        await user.save();

        res.json({ status: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error', error });
    }
});
module.exports = router;