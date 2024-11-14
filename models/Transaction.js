const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transaction_id: { type: String, unique: true, required: true }, // auto-generated
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    date: { type: Date, default: Date.now },
    credit_from_name: { type: String },
    credit_from_account_number: { type: String }
});

module.exports = mongoose.model('Transaction', transactionSchema);
