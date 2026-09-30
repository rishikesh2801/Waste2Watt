const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    trackingId: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    photoUrl: { type: String }, // Provided by Cloudinary
    status: { type: String, enum: ['Pending', 'Resolved'], default: 'Pending' },
    isSeen: { type: Boolean, default: false },
    isAssigned: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
