const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Credit = require('../models/Credit');
const Debit = require('../models/Debit');
const Balance = require('../models/Balance');
const Beneficiary = require('../models/Beneficiary');
const Notification = require('../models/Notification');
const { auth } = require('../modules/middleware_modules/user_middleware')
const User = require('../models/User');

router.post('/transfer', auth, async (req, res) => {
    const { amount, credit_from_name, credit_from_account_number } = req.body;
    const from_user_id = req.user._id;

    try {
        const fromUser = await Beneficiary.findOne({ user_id: from_user_id });
        if (!fromUser) {
            return res.status(400).json({ status: false, message: 'Beneficiary details not found' });
        }

        // 1. Find recipient Beneficiary by name and account number
        const toUser = await Beneficiary.findOne({ account_number: credit_from_account_number });
        if (!toUser) {
            return res.status(400).json({ status: false, message: 'Recipient not found' });
        }

        const to_user_id = toUser.user_id;
        const to_ifsc_code = toUser.ifsc_code;
        const from_ifsc_code = fromUser.ifsc_code;

        // 2. Check for sufficient balance in sender's account
        const fromUserBalance = await Balance.findOne({ user_id: from_user_id });
        if (!fromUserBalance || fromUserBalance.balance < amount) {
            return res.status(400).json({ status: false, message: 'Insufficient funds' });
        }

        // 3. Deduct from sender's balance and log debit transaction
        const transaction_id = uuidv4();
        fromUserBalance.balance -= amount;
        await fromUserBalance.save();

        const debit = new Debit({
            amount,
            account_number: toUser.account_number, // assuming sender's account number is in the user model
            transaction_id,
            ifsc_code: from_ifsc_code,
            transaction_type: 'debit',
            debited_to: to_user_id,
            debited_from: from_user_id,
            date: new Date()
        });
        await debit.save();

        // 4. Credit to recipient's balance and log credit transaction
        let toUserBalance = await Balance.findOne({ user_id: to_user_id });
        if (!toUserBalance) {
            toUserBalance = new Balance({ user_id: to_user_id, balance: 0 });
        }
        toUserBalance.balance += amount;
        await toUserBalance.save();

        const credit = new Credit({
            amount,
            account_number: credit_from_account_number,
            transaction_id,
            ifsc_code: to_ifsc_code,
            transaction_type: 'credit',
            credited_to: to_user_id,
            credited_by: from_user_id,
            date: new Date()
        });
        await credit.save();

        // 5. Notifications for both users
        const fromNotification = new Notification({
            user_id: from_user_id,
            message: `You have successfully transferred ${amount} to ${credit_from_name}.`,
            transaction_id,
            date: new Date()
        });
        await fromNotification.save();

        const toNotification = new Notification({
            user_id: to_user_id,
            message: `You have received ${amount} from ${req.user.name}.`,
            transaction_id,
            date: new Date()
        });
        await toNotification.save();

        res.json({ status: true, message: 'Fund transferred successfully', transaction_id });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error', error });
    }
});

// API to add funds
router.post('/addFunds', auth, async (req, res) => {
    const { amount, account_number, ifsc_code, swift_code } = req.body;
    const user_id = req.user._id;

    try {
        if (amount <= 0) {
            return res.status(400).json({ status: false, message: 'Amount should be greater than zero' });
        }

        // Validate account details
        const userAccount = await Beneficiary.findOne({ user_id, account_number });
        if (!userAccount) {
            return res.status(400).json({ status: false, message: 'Account details do not match the user' });
        }

        // Find or initialize the balance
        let userBalance = await Balance.findOne({ user_id });
        if (!userBalance) {
            userBalance = new Balance({ user_id, balance: 0 });
        }

        // Update balance
        userBalance.balance += amount;
        await userBalance.save();

        // Log the credit transaction
        const credit = new Credit({
            transaction_id: uuidv4(),
            amount,
            account_number,
            ifsc_code,
            swift_code,
            credited_to: user_id,
            credited_by: user_id,
            transaction_type: 'credit',
            date: new Date()
        });
        await credit.save();

        // Create a notification
        const notificationMessage = `Your account has been credited with ${amount}. Your new balance is ${userBalance.balance}.`;
        const notification = new Notification({
            user_id,
            transaction_id: credit.transaction_id,
            amount,
            transaction_type: 'credit',
            message: notificationMessage
        });
        await notification.save();

        res.json({ status: true, message: 'Funds added successfully', balance: userBalance.balance });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error', error });
    }
});

// API to withdraw funds
router.post('/withdrawFunds', auth, async (req, res) => {
    const { amount, account_number, ifsc_code, swift_code } = req.body;
    const user_id = req.user._id;

    try {
        if (amount <= 0) {
            return res.status(400).json({ status: false, message: 'Amount should be greater than zero' });
        }

        // Validate account details
        const userAccount = await Beneficiary.findOne({ user_id, account_number });
        if (!userAccount) {
            return res.status(400).json({ status: false, message: 'Account details do not match the user' });
        }

        // Check for sufficient balance
        const userBalance = await Balance.findOne({ user_id });
        if (!userBalance || userBalance.balance < amount) {
            return res.status(400).json({ status: false, message: 'Insufficient funds' });
        }

        // Update balance
        userBalance.balance -= amount;
        await userBalance.save();

        // Log the debit transaction
        const debit = new Debit({
            transaction_id: uuidv4(),
            amount,
            account_number,
            ifsc_code,
            swift_code,
            debited_to: user_id,
            debited_from: user_id,
            transaction_type: 'debit',
            date: new Date()
        });
        await debit.save();

        // Create a notification
        const notificationMessage = `Your account has been debited with ${amount}. Your new balance is ${userBalance.balance}.`;
        const notification = new Notification({
            user_id,
            transaction_id: debit.transaction_id,
            amount,
            transaction_type: 'debit',
            message: notificationMessage
        });
        await notification.save();

        res.json({ status: true, message: 'Funds withdrawn successfully', balance: userBalance.balance });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error', error });
    }
});

module.exports = router;
