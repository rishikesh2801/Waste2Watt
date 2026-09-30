const express = require('express');
const router = express.Router();
const Fund = require('../models/Fund');

// Original data to seed if the database is empty
const defaultFunds = [
    { category: 'IoT Dustbin Infrastructure',    allocated: 14000000, used: 12700000, color: '#16a34a' },
    { category: 'Waste-to-Energy Plant O&M',     allocated: 18000000, used: 16200000, color: '#2563eb' },
    { category: 'Workforce & Training',          allocated: 6000000,  used: 4800000,  color: '#f59e0b' },
    { category: 'Citizen Awareness Programs',    allocated: 3000000,  used: 1900000,  color: '#8b5cf6' },
    { category: 'Vehicle Fleet Maintenance',     allocated: 5500000,  used: 3800000,  color: '#0891b2' },
    { category: 'Software & Portal Development', allocated: 2000000,  used: 1800000,  color: '#f97316' }
];

// @route   GET api/funds
// @desc    Get all funds, seeding initial data if empty
router.get('/', async (req, res) => {
    try {
        let funds = await Fund.find();
        if (funds.length === 0) {
            console.log("No funds found in DB. Seeding initial default funds...");
            await Fund.insertMany(defaultFunds);
            funds = await Fund.find();
        }
        res.status(200).json(funds);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PATCH api/funds
// @desc    Update allocated and/or used amount for a specific category
router.patch('/', async (req, res) => {
    try {
        const { category, allocatedToAdd, usedToAdd } = req.body;
        
        if (!category) {
            return res.status(400).json({ msg: 'Please provide a valid category' });
        }

        let fund = await Fund.findOne({ category });
        if (!fund) {
            // Generate a random pleasant color for the new fund
            const colors = ['#f43f5e', '#d946ef', '#8b5cf6', '#0ea5e9', '#14b8a6', '#84cc16'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            fund = new Fund({
                category,
                allocated: Number(allocatedToAdd) || 0,
                used: Number(usedToAdd) || 0,
                color: randomColor
            });
            await fund.save();
        } else {
            fund.allocated += Number(allocatedToAdd) || 0;
            fund.used += Number(usedToAdd) || 0;
            await fund.save();
        }

        res.status(200).json(fund);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
