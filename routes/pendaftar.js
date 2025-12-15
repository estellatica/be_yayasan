import express from 'express';
import multer from 'multer';
import path from 'path';
import db from '../db.js';

const router = express.Router();

// === SETUP MULTER (Tetap Sama) ===
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// === ROUTE POST SESUAI TABEL 'pendaftar' ===
router.post('/', upload.single('bukti_transfer'), async (req, res) => {
    try {
        // 1. Ambil data sesuai kolom di Database
        const { nama, jenis_kelamin, jenjang, kategori, no_wa } = req.body;
        
        // 2. Ambil gambar
        const buktiTransfer = req.file ? req.file.filename : null;

        // Validasi sederhana
        if (!nama || !no_wa || !buktiTransfer) {
            return res.status(400).json({ message: "Nama, No WA, dan Bukti Transfer wajib diisi" });
        }

        // 3. Query INSERT ke tabel 'pendaftar'
        // Kita set status default jadi 'Menunggu' atau 'Pending'
        const sql = `
            INSERT INTO pendaftar 
            (nama, jenis_kelamin, jenjang, kategori, no_wa, bukti_transfer, status) 
            VALUES (?, ?, ?, ?, ?, ?, 'Menunggu Verifikasi')
        `;
        
        await db.query(sql, [nama, jenis_kelamin, jenjang, kategori, no_wa, buktiTransfer]);

        res.status(201).json({ message: "Pendaftaran berhasil dikirim!" });

    } catch (err) {
        console.error("Error Pendaftaran:", err);
        res.status(500).json({ message: "Gagal menyimpan pendaftaran", error: err.message });
    }
});

export default router;