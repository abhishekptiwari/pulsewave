const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
    balance: { type: Number, default: 0 }
});

module.exports = mongoose.model('Balance', balanceSchema);
