const express = require('express');
const router = express.Router();
const { validateImage } = require('../utils/aiValidator');
const multer = require('multer');
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// @route   POST api/ai/validate
// @desc    Validate image content using Gemini AI
router.post('/validate', upload.single('photo'), async (req, res) => {
    try {
        const { description, mode } = req.body;
        
        if (!req.file && !req.body.photoBase64) {
            return res.status(400).json({ error: "Image is required" });
        }

        let imageBase64 = "";
        if (req.file) {
            imageBase64 = req.file.buffer.toString('base64');
        } else {
            imageBase64 = req.body.photoBase64.split(',')[1] || req.body.photoBase64;
        }

        console.log(`🤖 AI Validation Triggered [Mode: ${mode}]...`);
        const result = await validateImage(imageBase64, description, mode);
        console.log(`✅ AI Result:`, result);

        res.json(result);
    } catch (err) {
        console.error("AI Route Error:", err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
