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

// Check for required environment variables
if (!PREDICTION_KEY || !ENDPOINT_URL) {
  // Log an error and stop the server if env vars are missing
  console.error('❌ Missing PREDICTION_KEY or ENDPOINT_URL in .env');
  process.exit(1); // Exit the process with failure
}

// POST endpoint to handle image upload and classification
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Get the path of the uploaded image from multer
    const imagePath = req.file.path;

    // Read the image file from disk into a buffer
    const imageBuffer = fs.readFileSync(imagePath);

    // Send the image buffer to Azure Custom Vision API
    const azureResponse = await axios.post(ENDPOINT_URL, imageBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream', 
        'Prediction-Key': PREDICTION_KEY
      }
    });

    // Delete the image file after processing to save disk space
    fs.unlinkSync(imagePath);

    // Return Azure's prediction results to the client
    res.json(azureResponse.data);

  } catch (error) {
    // Log any errors for debugging
    console.error('Prediction error:', error.message);

    // Send a 500 Internal Server Error response to the client
    res.status(500).json({ error: 'Prediction failed' });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server is running at http://localhost:${PORT}`);
  // console.log('Prediction Key:', process.env.PREDICTION_KEY);
});
