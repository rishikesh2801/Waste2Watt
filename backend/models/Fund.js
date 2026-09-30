const mongoose = require('mongoose');

const FundSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        unique: true
    },
    allocated: {
        type: Number,
        required: true,
        default: 0
    },
    used: {
        type: Number,
        required: true,
        default: 0
    },
    color: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Fund', FundSchema);
