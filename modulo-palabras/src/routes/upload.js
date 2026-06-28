const express = require('express');
const cloudinary = require('cloudinary').v2;
const { authMiddleware, requireProfesor } = require('../middleware/auth');

const router = express.Router();

const configurado = Boolean(process.env.CLOUDINARY_CLOUD_NAME);

if (configurado) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

router.get('/status', (req, res) => {
  res.json({
    configurado,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || null,
  });
});

router.post('/signature', authMiddleware, requireProfesor, (req, res) => {
  if (!configurado) {
    return res.status(400).json({
      error: 'Cloudinary no está configurado. Agrega CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET al .env',
    });
  }

  const { folder = 'senasapp' } = req.body;
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp,
    folder,
    quality: "auto:good",
    bitrate: "500k",
  };

  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

  res.json({
    signature,
    timestamp,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    folder,
  });
});

module.exports = router;
