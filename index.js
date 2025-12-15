// index.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// ===== DATABASE =====
require('./db'); // cukup load koneksi

// ===== ROUTES =====
const beritaRoutes = require('./routes/berita');
const pendaftarRoutes = require('./routes/pendaftar');
const authRoutes = require('./routes/auth');

// ===== PORT =====
const PORT = process.env.PORT || 5000;

// ===== MIDDLEWARE =====
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== ROUTES =====
app.use('/api', authRoutes);
app.use('/api/berita', beritaRoutes);
app.use('/api/pendaftar', pendaftarRoutes);

// ===== ROOT CHECK =====
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Backend Yayasan jalan 🚀',
    status: 'online'
  });
});

// ===== 404 =====
app.use((req, res) => {
  res.status(404).json({ message: 'Route tidak ditemukan' });
});

// ===== ERROR =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
