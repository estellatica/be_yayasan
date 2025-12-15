// File: app.js (SETELAH PERBAIKAN)

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require("path");

// --- IMPORT DARI FILE LAIN ---
// Koneksi database
const db = require('./db'); 

// Import Routes yang sudah dipecah
const beritaRoutes = require('./routes/berita'); 
const pendaftarRoutes = require('./routes/pendaftar');
const authRoutes = require('./routes/auth'); // <--- BARU

const app = express();
// Gunakan environment variable untuk port di produksi, fallback ke 5000
const PORT = process.env.PORT || 5000; 

// --- MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Folder gambar public

// --- Cek Koneksi Database (Opsional, tapi bagus untuk debugging) ---
db.connect(err => {
    if (err) {
        console.error('Gagal koneksi ke database:', err.stack);
        // Pertimbangkan untuk exit jika koneksi DB kritis
        // process.exit(1); 
        return;
    }
    console.log('✅ Terhubung ke database dengan ID:', db.threadId);
});


// =================== IMPLEMENTASI ROUTES =================== //

// Route Otentikasi (Daftar & Login)
app.use('/api', authRoutes); // Menggunakan /api sebagai base, di auth.js kita gunakan /daftar dan /login

// Route Khusus Berita
app.use('/api/berita', beritaRoutes); 

// Route Khusus Pendaftar (GET oleh Admin)
app.use('/api/pendaftar', pendaftarRoutes); 

// =================== TANGANI ROOT URL (/) =================== //
// Tambahkan kode ini di sini!
app.get('/', (req, res) => {
    // Memberikan respon sederhana untuk memverifikasi bahwa server Node.js berjalan
    res.status(200).json({ 
        message: "Server Backend Yayasan Berjalan!",
        status: "online",
        api_base_url: "/api"
    });
});

// =================== PENANGANAN ERROR (BEST PRACTICE) =================== //

// Middleware untuk menangkap error 404
app.use((req, res, next) => {
    res.status(404).send({ message: "Route Tidak Ditemukan!" });
});

// Middleware penanganan error global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Terjadi Kesalahan Server!' });
});


// ---- JALANKAN SERVER ----
app.listen(PORT, () => {
    console.log(`🚀 Server backend jalan di http://localhost:${PORT}`);
});