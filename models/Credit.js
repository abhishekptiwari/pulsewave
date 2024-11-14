const mongoose = require('mongoose');

const creditSchema = new mongoose.Schema({
    transaction_id: { type: String, unique: true, required: true },
    amount: { type: Number, required: true },
    account_number: { type: String, required: true },
    ifsc_code: { type: String, required: true },
    swift_code: { type: String },
    transaction_type: { type: String, default: 'credit' },
    credited_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    credited_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    account_holder_name: { type: String },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Credit', creditSchema);
