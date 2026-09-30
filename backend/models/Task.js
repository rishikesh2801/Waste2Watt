const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    description: { type: String, required: true },
    assignedToId: { type: String, required: true }, // Identifier for the staff
    assignedToName: { type: String, required: true },
    assignedByRole: { type: String, required: true },
    status: { type: String, default: 'assigned' }, 
    location: { type: String },
    timeAllotted: { type: Number },
    linkedComplaintId: { type: String },
    completionPhotoUrl: { type: String }, // Provided by Cloudinary upon completion
    createdAt: { type: Date, default: Date.now },
    startTime: { type: Date },
    completedAt: { type: Date }
});

module.exports = mongoose.model('Task', TaskSchema);
