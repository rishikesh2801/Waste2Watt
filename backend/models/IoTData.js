const mongoose = require('mongoose');

const IoTDataSchema = new mongoose.Schema({
    dustbinId: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    fillLevel: { type: Number, required: true, default: 0 }, // Percentage (0-100)
    batteryStatus: { type: Number, default: 100 }, // Percentage (0-100)
    signalStrength: { type: String, enum: ['Strong', 'Fair', 'Weak'], default: 'Strong' },
    status: { type: String, enum: ['Empty', 'Normal', 'Attention', 'Full'], default: 'Empty' },
    lastUpdated: { type: Date, default: Date.now },
    unlockTimestamp: { type: Date }
});

module.exports = mongoose.model('IoTData', IoTDataSchema);
