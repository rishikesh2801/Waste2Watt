const mongoose = require('mongoose');
const StaffSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String },
    aadhar: { type: String },
    fatherName: { type: String },
    personalEmail: { type: String },
    vehicleNumber: { type: String },
    assignedVehicle: { type: String },
    photo: { type: String },
    password: { type: String, default: 'password' },
    createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Staff', StaffSchema);
