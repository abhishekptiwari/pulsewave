// routes/beneficiaryRoutes.js
const express = require('express');
const router = express.Router();
const Beneficiary = require('../models/Beneficiary');
const { beneficiaryAuth } = require('../modules/middleware_modules/user_middleware')

// Add Beneficiary
router.post('/beneficiary', beneficiaryAuth, async (req, res) => {
    const { account_number, ifsc_code, swift_code } = req.body;

    try {

        // Check if account_number already exists
        const existingBeneficiary = await Beneficiary.findOne({ account_number });
        if (existingBeneficiary) {
            return res.status(400).json({ status: false, message: "Account number already exists." });
        }

        let beneficiary_unique_code = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        const beneficiary = new Beneficiary({
            ifsc_code,
            swift_code,
            account_number,
            user_id: req.user._id, // From the decoded JWT payload
            username: req.user.username,
            beneficiary_unique_code: beneficiary_unique_code,
        });

        await beneficiary.save();
        res.status(201).json({ status: true, message: 'Beneficiary added successfully', beneficiary });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error', error });
    }
});


// Update Beneficiary
router.put('/beneficiary/:id', beneficiaryAuth, async (req, res) => {
    const { beneficiary_unique_code, account_number, ifsc_code, swift_code } = req.body;

    try {
        if(!beneficiary_unique_code){
            return res.status(403).json({ status: false, message: 'Provide beneficiary_unique_code to update specific beneficiary.' });

        }
        const beneficiary = await Beneficiary.findOne({ _id: req.params.id, user_id: req.user._id, beneficiary_unique_code });

        if (!beneficiary) {
            return res.status(403).json({ status: false, message: 'Access denied. You can only update your own beneficiaries.' });
        }

        // Update fields
        // beneficiary.beneficiary_unique_code = beneficiary_unique_code || beneficiary.beneficiary_unique_code;
        beneficiary.account_number = account_number || beneficiary.account_number;
        beneficiary.ifsc_code = ifsc_code || beneficiary.ifsc_code;
        beneficiary.swift_code = swift_code || beneficiary.swift_code;

        await beneficiary.save();
        res.json({ status: true, message: 'Beneficiary updated successfully', beneficiary });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error', error });
    }
});


// Delete Beneficiary
router.delete('/beneficiary/:id', beneficiaryAuth, async (req, res) => {
    try {
        const beneficiary = await Beneficiary.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });

        if (!beneficiary) {
            return res.status(403).json({ status: false, message: 'Access denied. You can only delete your own beneficiaries.' });
        }

        res.json({ status: true, message: 'Beneficiary deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error', error });
    }
});


// View All Beneficiaries
router.get('/beneficiaries', beneficiaryAuth, async (req, res) => {
    try {
        const beneficiaries = await Beneficiary.find({ user_id: req.user._id });
        res.json({ status: true, beneficiaries });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server error', error });
    }
});

module.exports = router;
