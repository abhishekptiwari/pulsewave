const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Balance = require('../models/Balance');
const Transaction = require('../models/Transaction');
const { adminAuth, auth, addTokenToBlacklist, isTokenBlacklisted } = require('../modules/middleware_modules/user_middleware')

router.get('/statement', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user_id: req.user._id });
        res.json({ status: true, transactions });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error', error });
    }
});


router.get('/balance', auth, async (req, res) => {
    try {
        const balanceData = await Balance.findOne({ user_id: req.user._id });
        const balance = balanceData ? balanceData.balance : 0;
        res.json({ status: true, balance });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error', error });
    }
});



module.exports = router;
