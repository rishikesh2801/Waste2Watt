const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');

// @route   GET api/staff
// @desc    Get all staff, initializing default if completely empty
router.get('/', async (req, res) => {
    try {
        let staff = await Staff.find();
        
        // Auto-seed if database is virgin/empty
        if (staff.length === 0) {
            console.log("No staff found in DB. Seeding initial demo staff...");
            const defaultStaff = [];
            
            const names = [
              'Amit Kumar', 'Rohan Singh', 'Suresh Verma', 'Pooja Sharma', 'Neha Singh',
              'Rajesh Patel', 'Sandeep Sharma', 'Anjali Patel', 'Sneha Verma', 'Priya Das',
              'Manoj Tiwari', 'Anil Das', 'Vikas Yadav', 'Sanjay Gupta', 'Rahul Joshi',
              'Riya Yadav', 'Kavita Gupta', 'Deepak Choudhury', 'Akash Reddy', 'Sunil Mishra',
              'Aarti Joshi', 'Swati Choudhury', 'Mukesh Agarwal', 'Ravi Kumar', 'Vijay Singh',
              'Jyoti Reddy', 'Nisha Mishra', 'Dinesh Patel', 'Puneet Sharma', 'Yash Verma',
              'Rashmi Agarwal', 'Shilpa Kumar', 'Aditya Rao', 'Kiran Das', 'Ramesh Yadav',
              'Monika Singh', 'Rekha Patel', 'Manish Gupta', 'Satish Joshi', 'Anita Sharma',
              'Geeta Verma', 'Sita Rao', 'Suman Das', 'Meena Yadav', 'Arun Patel'
            ];
            
            let nameIdx = 0;
            const generateProfile = (index) => {
               const hashStr = ((index + 1) * 137).toString().padStart(3, '0');
               const idStr = index.toString().padStart(2, '1');
               const lastName = names[index].split(' ')[1] || 'Kumar';
               return {
                 mobile: `+91 98${idStr}45${hashStr}`,
                 aadhar: `4${idStr}7 8${hashStr} 12${idStr}`,
                 fatherName: `Rajendra ${lastName}`,
                 photo: '/logo.jpg'
               };
            };
        
            for(let i=1; i<=20; i++) {
                defaultStaff.push({ 
                    id: `WC-${i}`, name: names[nameIdx], role: 'Waste Collector', email: `wc${i}@mcr.gov.in`, 
                    ...generateProfile(nameIdx) 
                });
                nameIdx++;
            }
            for(let i=1; i<=15; i++) {
                defaultStaff.push({ 
                    id: `VM-${i}`, name: names[nameIdx], role: 'Vehicle Manager', email: `vm${i}@mcr.gov.in`, 
                    vehicleNumber: `UK 08 AB ${1000 + i}`, assignedVehicle: `Garbage Truck ${i < 10 ? '0'+i : i}`,
                    ...generateProfile(nameIdx) 
                });
                nameIdx++;
            }
            for(let i=1; i<=10; i++) {
                defaultStaff.push({ 
                    id: `SM-${i}`, name: names[nameIdx], role: 'Service Men', email: `sm${i}@mcr.gov.in`, 
                    ...generateProfile(nameIdx) 
                });
                nameIdx++;
            }
            
            await Staff.insertMany(defaultStaff);
            staff = await Staff.find();
        }
        res.status(200).json(staff);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PATCH api/staff/:id
// @desc    Update a specific staff profile by custom text `id` (e.g. 'WC-1')
router.patch('/:id', async (req, res) => {
    try {
        const staff = await Staff.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
        if (!staff) return res.status(404).json({ msg: 'Staff not found' });
        res.status(200).json(staff);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   DELETE api/staff/:id
// @desc    Delete a specific staff profile by custom text `id` (e.g. 'WC-1')
router.delete('/:id', async (req, res) => {
    try {
        const result = await Staff.findOneAndDelete({ id: req.params.id });
        if (!result) return res.status(404).json({ msg: 'Staff not found' });
        res.status(200).json({ msg: 'Staff deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
