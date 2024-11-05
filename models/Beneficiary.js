// models/Beneficiary.js
const mongoose = require('mongoose');

const BeneficiarySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    nick_name: {
        type: String,
    },
    last_name: {
        type: String,
        required: true
    },
    first_name: {
        type: String,
        required: true
    },
    contact_number: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    beneficiary_unique_code: {
        type: String,
        required: true,
        unique: true
    },
    account_number: {
        type: String,
        required: true
    },
    ifsc_code: {
        type: String,
        required: true
    },
    swift_code: {
        type: String,
        required: false
    },
}, { timestamps: true });

module.exports = mongoose.model('Beneficiary', BeneficiarySchema);
