const express = require('express');
const router  = express.Router();
const nodemailer = require('nodemailer');
const { otpEmail } = require('../utils/emailTemplates');

// Nodemailer config from .env
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// @route   POST api/otp/send
// @desc    Send OTP via Email with Waste2Watt branding
router.post('/send', async (req, res) => {
    const { mobile, otp, email, name } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required for verification' });
    }

    const template = otpEmail({ name, otp });

    const mailOptions = {
        from: `"Waste2Watt — Municipal Corporation Roorkee" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: template.subject,
        html: template.html
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP Email sent to: ${email}`);
        res.status(200).json({ msg: 'OTP sent to email successfully' });
    } catch (error) {
        console.error('❌ Error sending OTP email:', error);
        res.status(500).json({ error: 'Failed to send OTP email' });
    }
});

module.exports = router;
