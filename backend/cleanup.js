require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Task = require('./models/Task');
const Complaint = require('./models/Complaint');

async function cleanDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        // Delete resolved complaints
        const complaintRes = await Complaint.deleteMany({ status: 'Resolved' });
        console.log(`Deleted ${complaintRes.deletedCount} resolved complaints.`);

        // Delete completed / pending verification tasks
        const taskRes = await Task.deleteMany({
            status: { $in: ['Completed', 'completed', 'completed_late', 'Pending Verification', 'pending verification'] }
        });
        console.log(`Deleted ${taskRes.deletedCount} completed tasks.`);

        console.log('Cleanup successful.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
cleanDB();
