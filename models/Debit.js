const mongoose = require('mongoose');

const debitSchema = new mongoose.Schema({
    transaction_id: { type: String, unique: true, required: true },
    amount: { type: Number, required: true },
    account_number: { type: String, required: true },
    ifsc_code: { type: String, required: true },
    swift_code: { type: String },
    transaction_type: { type: String, default: 'debit' },
    debited_from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    debited_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    account_holder_name: { type: String },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Debit', debitSchema);
