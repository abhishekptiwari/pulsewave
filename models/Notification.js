const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    transaction_id: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
