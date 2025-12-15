import express from 'express';
import 'dotenv/config'; 
import cors from 'cors'; // Diperbaiki dari require('cors')
import bodyParser from 'body-parser'; // Diperbaiki dari require('body-parser')

// --- Import tambahan untuk menangani __dirname dan path statis ---
import path, { dirname } from 'path'; // Digunakan untuk path.join
import { fileURLToPath } from 'url'; // Digunakan untuk mendapatkan path saat ini

// --- Import file lokal ---
import './db.js'; // Diperbaiki dari require('./db'), pastikan file db bernama db.js
import beritaRoutes from './routes/berita.js'; // Diperbaiki dari require('./routes/berita')
import pendaftarRoutes from './routes/pendaftar.js'; // Diperbaiki dari require('./routes/pendaftar')
import authRoutes from './routes/auth.js'; // Diperbaiki dari require('./routes/auth')

const app = express();

// **ES MODULE FIX**: Mendefinisikan ulang __dirname dan __filename
// Ini diperlukan karena dalam ES Modules, variabel __dirname dan __filename tidak lagi global.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ===== PORT =====
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

// ===== MIDDLEWARE =====
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Sekarang, path.join akan berfungsi dengan __dirname yang sudah didefinisikan ulang
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===== ROUTES =====
app.use('/api/auth', authRoutes);         
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