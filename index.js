import express from 'express';
import 'dotenv/config'; 
import cors from 'cors'; 
import path, { dirname } from 'path'; 
import { fileURLToPath } from 'url'; 
import fs from 'fs'; // Tambahan: untuk cek folder uploads

// --- Import file lokal ---
// Tidak perlu import db.js di sini jika server.js tidak melakukan query database langsung.
// Koneksi database akan dipanggil otomatis saat routes diakses.
import beritaRoutes from './routes/berita.js'; 
import pendaftarRoutes from './routes/pendaftar.js'; 
import authRoutes from './routes/auth.js'; 

const app = express();

// **ES MODULE FIX**: Setup Path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ===== PORT =====
const PORT = process.env.PORT || 5000;

// ===== CORS CONFIG =====
// Pastikan di .env ada FRONTEND_URL=http://localhost:5173
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Fallback jika .env kosong
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Izinkan cookie/token jika nanti diperlukan
};

// ===== MIDDLEWARE =====
app.use(cors(corsOptions)); // ✅ FIX: Gunakan options yang sudah dibuat
app.use(express.json()); // ✅ Modern: Pengganti bodyParser.json()
app.use(express.urlencoded({ extended: true })); // ✅ Modern: Pengganti bodyParser.urlencoded

// ===== STATIC FILES (GAMBAR) =====
// Cek apakah folder 'uploads' ada, jika tidak buat dulu biar gak error
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
    console.log("Folder 'uploads' berhasil dibuat otomatis.");
}

// Buka akses folder uploads ke publik
// URL nanti: http://localhost:5000/uploads/foto-santri.jpg
app.use('/uploads', express.static(uploadDir));

// ===== ROUTES =====
app.use('/api/auth', authRoutes);         
app.use('/api/berita', beritaRoutes);     
app.use('/api/pendaftar', pendaftarRoutes);

// ===== ROOT CHECK =====
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Backend Yayasan Berjalan 🚀',
    env: process.env.NODE_ENV || 'development',
    frontend_origin: process.env.FRONTEND_URL
  });
});

// ===== 404 & ERROR HANDLING =====
app.use((req, res) => {
  res.status(404).json({ message: 'Route tidak ditemukan' });
});

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// ===== START =====
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});