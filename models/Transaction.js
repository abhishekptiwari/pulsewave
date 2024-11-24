const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transaction_id: { type: String, required: true }, // No `unique: true`
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    date: { type: Date, default: Date.now },
    description: { type: String },
});

module.exports = mongoose.model('Transaction', transactionSchema);
