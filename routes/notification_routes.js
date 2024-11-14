const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth } = require('../modules/middleware_modules/user_middleware')

router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ user_id: req.user._id }).sort({ date: -1 });
        res.json({ status: true, notifications });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error', error });
    }
});

module.exports = router;
