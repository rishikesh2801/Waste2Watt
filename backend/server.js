const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic route
app.get('/', (req, res) => {
    res.send('Welcome to the Municipal Corporation Backend API!');
});

// Import Routes
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/iot', require('./routes/iot'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/otp', require('./routes/otp'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/funds', require('./routes/funds'));

const PORT = process.env.PORT || 5000;

async function startServer() {
    if (!process.env.MONGO_URI) {
        console.error('Missing MONGO_URI in backend/.env');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');

        // Auto-Cleanup: Delete resolved complaints older than 24 hours (runs every hour)
        const Complaint = require('./models/Complaint');
        setInterval(async () => {
            try {
                const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                const result = await Complaint.deleteMany({
                    status: 'Resolved',
                    resolvedAt: { $lt: twentyFourHoursAgo }
                });
                if (result.deletedCount > 0) {
                    console.log(`[Auto-Cleanup] Permanently deleted ${result.deletedCount} resolved complaints older than 24 hours.`);
                }
            } catch (err) {
                console.error("Auto-cleanup error:", err);
            }
        }, 60 * 60 * 1000); // 1 hour

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}

startServer();
