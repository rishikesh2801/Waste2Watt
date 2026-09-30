const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { upload } = require('../config/cloudinaryConfig');

// @route   POST api/tasks
// @desc    Assign a new task
router.post('/', async (req, res) => {
    try {
        const { description, assignedToId, assignedToName, assignedByRole, location, timeAllotted, linkedComplaintId } = req.body;

        const newTask = new Task({
            description,
            assignedToId,
            assignedToName,
            assignedByRole,
            location,
            timeAllotted,
            linkedComplaintId,
            status: 'assigned'
        });

        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET api/tasks
// @desc    Get all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PATCH api/tasks/:id/start
// @desc    Mark task as active/started (by Collector/Manager)
router.patch('/:id/start', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        task.status = 'active';
        task.startTime = Date.now();
        
        await task.save();
        res.status(200).json({ msg: 'Task started successfully.', task });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PATCH api/tasks/:id/complete
// @desc    Mark task as completed (by Collector/Manager) with photo proof
router.patch('/:id/complete', upload.single('photo'), async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        // Photo is required only for non-IoT tasks
        const isIoT = task.description && task.description.includes('IOT ALERT');
        if (!req.file && !isIoT) {
            return res.status(400).json({ msg: 'Photo proof is required to complete the task.' });
        }

        if (req.file) {
            let photoUrl = req.file.path;
            if (!photoUrl.startsWith('http')) {
                photoUrl = '/api/uploads/' + req.file.filename;
            }
            task.completionPhotoUrl = photoUrl;
        }

        task.status = 'Pending Verification';
        task.completedAt = Date.now();
        if (req.body.notes) task.notes = req.body.notes;
        
        await task.save();
        res.status(200).json({ msg: 'Task marked for verification.', task });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PATCH api/tasks/:id/verify
// @desc    Approve or reject a task (by ServiceMen)
router.patch('/:id/verify', async (req, res) => {
    try {
        const { action } = req.body; // 'approved' or 'rejected'
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        if (action === 'approved') {
            task.status = 'Completed';
        } else if (action === 'rejected') {
            task.status = 'Active';
            task.completionPhotoUrl = null; // resets photo
        } else {
            return res.status(400).json({ msg: 'Invalid action parameter' });
        }

        await task.save();
        res.status(200).json({ msg: `Task has been ${action}`, task });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   DELETE api/tasks/:id
// @desc    Delete a task (e.g. Worker deleting completed record)
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        res.status(200).json({ msg: 'Task successfully deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
