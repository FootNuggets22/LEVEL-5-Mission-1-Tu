// index.js
require('dotenv').config(); // Load .env variables

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Enable CORS for frontend access
app.use(cors());

// Read values from .env
const PREDICTION_KEY = process.env.PREDICTION_KEY;
const ENDPOINT_URL = process.env.ENDPOINT_URL;

if (!PREDICTION_KEY || !ENDPOINT_URL) {
  console.error('❌ Missing PREDICTION_KEY or ENDPOINT_URL in .env');
  process.exit(1);
}

// Endpoint to receive image and classify
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const imageBuffer = fs.readFileSync(imagePath);

    const azureResponse = await axios.post(ENDPOINT_URL, imageBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Prediction-Key': PREDICTION_KEY
      }
    });

    fs.unlinkSync(imagePath); // Clean up uploaded file
    res.json(azureResponse.data);
  } catch (error) {
    console.error('Prediction error:', error.message);
    res.status(500).json({ error: 'Prediction failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server is running at http://localhost:${PORT}`);
  // console.log('Prediction Key:', process.env.PREDICTION_KEY);
});
