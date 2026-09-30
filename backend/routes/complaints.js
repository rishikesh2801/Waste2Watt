const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { upload } = require('../config/cloudinaryConfig');
const nodemailer = require('nodemailer');
const { complaintRegisteredEmail, complaintResolvedEmail } = require('../utils/emailTemplates');

// Nodemailer config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const FROM_NAME = `"Waste2Watt — Municipal Corporation Roorkee" <${process.env.EMAIL_USER}>`;

// @route   POST api/complaints
// @desc    Register a new complaint
router.post('/', upload.single('photo'), async (req, res) => {
    console.log("-----[ NEW COMPLAINT REQUEST RECEIVED ]-----");
    console.log("Payload Body:", req.body);
    try {
        const { name, email, mobile, description, location } = req.body;
        let photoUrl = null;
        if (req.file) {
            photoUrl = req.file.path;
            if (!photoUrl.startsWith('http')) {
                photoUrl = '/api/uploads/' + req.file.filename;
            }
        }

        // Generate a random 6-digit tracking ID
        const trackingId = 'C-' + Math.floor(100000 + Math.random() * 900000);

        const newComplaint = new Complaint({
            trackingId,
            name,
            email,
            mobile,
            description,
            location,
            photoUrl
        });

        const savedComplaint = await newComplaint.save();
        console.log("✅ Complaint saved in DB with ID:", savedComplaint._id);

        // ── Send branded confirmation email with full details ──────────────
        const template = complaintRegisteredEmail({
            name,
            trackingId,
            description,
            location,
            mobile,
            date: new Date().toLocaleString('en-IN', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            })
        });

        const mailOptions = {
            from: FROM_NAME,
            to: email,
            subject: template.subject,
            html: template.html
        };

        console.log("⏳ Attempting to dispatch Nodemailer to:", email);

        // Send async — don't block the API response
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('❌ Error sending confirmation email:', error);
            } else {
                console.log('✅ Confirmation email dispatched!', info.response);
            }
        });

        res.status(201).json(savedComplaint);
    } catch (err) {
        console.error("❌ Critical server failure:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// @route   GET api/complaints
// @desc    Get all complaints
router.get('/', async (req, res) => {
    try {
        const complaints = await Complaint.find().sort({ createdAt: -1 });
        res.status(200).json(complaints);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PATCH api/complaints/:id/resolve
// @desc    Mark complaint as resolved and notify user
router.patch('/:id/resolve', async (req, res) => {
    try {
        const idParam = req.params.id;
        const complaint = await Complaint.findOne({
            $or: [
                { _id: idParam.match(/^[0-9a-fA-F]{24}$/) ? idParam : null },
                { trackingId: idParam }
            ]
        });

        if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });

        complaint.status = 'Resolved';
        complaint.resolvedAt = Date.now();
        await complaint.save();

        // ── Auto-complete any linked tasks so worker is freed ──────────────
        try {
            const Task = require('../models/Task');
            await Task.updateMany(
                {
                    linkedComplaintId: { $in: [complaint.trackingId, complaint._id.toString()] },
                    status: { $in: ['assigned', 'active', 'Assigned', 'Active'] }
                },
                {
                    $set: {
                        status: 'Completed',
                        completedAt: Date.now(),
                        notes: 'Auto-completed: Complaint resolved directly by serviceman.'
                    }
                }
            );
        } catch (taskErr) {
            console.error('Auto-complete linked tasks failed:', taskErr.message);
        }
        // ──────────────────────────────────────────────────────────────────

        // ── Send branded resolved email ────────────────────────────────────
        const template = complaintResolvedEmail({
            name:        complaint.name,
            trackingId:  complaint.trackingId,
            description: complaint.description,
            location:    complaint.location
        });

        transporter.sendMail({
            from:    FROM_NAME,
            to:      complaint.email,
            subject: template.subject,
            html:    template.html
        }, (error) => {
            if (error) console.error('Error sending resolved email:', error);
        });
        // ──────────────────────────────────────────────────────────────────

        res.status(200).json({ msg: 'Complaint resolved and user notified.', complaint });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PATCH api/complaints/:id
// @desc    Update complaint fields
router.patch('/:id', async (req, res) => {
    try {
        const idParam = req.params.id;
        const updates = req.body;
        const complaint = await Complaint.findOneAndUpdate(
            {
                $or: [
                    { _id: idParam.match(/^[0-9a-fA-F]{24}$/) ? idParam : null },
                    { trackingId: idParam }
                ]
            },
            { $set: updates },
            { new: true }
        );

        if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });
        res.status(200).json(complaint);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   DELETE api/complaints/:id
// @desc    Delete a complaint
router.delete('/:id', async (req, res) => {
    try {
        const idParam = req.params.id;
        const complaint = await Complaint.findOneAndDelete({
            $or: [
                { _id: idParam.match(/^[0-9a-fA-F]{24}$/) ? idParam : null },
                { trackingId: idParam }
            ]
        });
        if (!complaint) return res.status(404).json({ msg: 'Complaint not found' });
        res.status(200).json({ msg: 'Complaint permanently deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
