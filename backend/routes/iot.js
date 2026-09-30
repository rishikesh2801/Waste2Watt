const express = require('express');
const router = express.Router();
const IoTData = require('../models/IoTData');

// @route   POST api/iot/update
// @desc    Receive telemetry data from Smart Dustbins
router.post('/update', async (req, res) => {
    try {
        const { dustbinId, location, fillLevel, batteryStatus, signalStrength, forceUnlock } = req.body;
        
        let status = 'Empty';
        if (fillLevel >= 90) status = 'Full';
        else if (fillLevel >= 75) status = 'Attention';
        else if (fillLevel > 20) status = 'Normal';

        // Check if the dustbin is already Full and locked
        const existingBin = await IoTData.findOne({ dustbinId });
        
        if (existingBin && existingBin.status === 'Full' && !forceUnlock && status !== 'Full') {
            // It is currently Full, and we are trying to set it to something else (e.g. Empty)
            // But forceUnlock is not true. So we ignore the Arduino's "Empty" signal and keep it Full!
            return res.status(200).json({ msg: 'Dustbin is locked in Full state. Ignored empty signal.', dustbin: existingBin });
        }

        // NEW: Protection against Race Condition from Arduino
        // If the App just unlocked it (status became Empty), the Arduino might still send "Full" 
        // for a few seconds before the Python bridge sends the U1/U2 command.
        // We will ignore any "Full" signals for 15 seconds after an unlock!
        if (existingBin && existingBin.unlockTimestamp && status === 'Full' && !forceUnlock) {
            const timeSinceUnlock = Date.now() - new Date(existingBin.unlockTimestamp).getTime();
            if (timeSinceUnlock < 15000) {
                // Ignore the false Full signal from Arduino during the cooldown
                return res.status(200).json({ msg: 'Ignored Full signal during unlock cooldown.', dustbin: existingBin });
            }
        }

        let updateData = {
           dustbinId, 
           location, 
           fillLevel, 
           batteryStatus, 
           signalStrength, 
           status,
           lastUpdated: Date.now()
        };

        if (forceUnlock) {
            updateData.unlockTimestamp = Date.now();
        }

        // Update if exists, otherwise create
        const dustbin = await IoTData.findOneAndUpdate(
            { dustbinId },
            updateData,
            { new: true, upsert: true }
        );

        res.status(200).json({ msg: 'Data received', dustbin });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET api/iot
// @desc    Get status of all smart dustbins
router.get('/', async (req, res) => {
    try {
        const data = await IoTData.find().sort({ dustbinId: 1 });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
