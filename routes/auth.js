 // auth.js

import express from 'express';
// Mengimpor db dari file db.js yang baru (promise-based)
import db from '../db.js'; 
import jwt from 'jsonwebtoken';

const router = express.Router();

// =====================
// DAFTAR PENDAFTAR (Menggunakan async/await)
// =====================
router.post('/daftar', async (req, res) => { // Fungsi diubah menjadi async
    const { nama_lengkap, asal_sekolah, nama_ortu, no_wa, jenjang_pilihan } = req.body;

    if (!nama_lengkap || !no_wa) {
        return res.status(400).send('Nama lengkap dan No. WA wajib diisi.');
    }

    const sql = `
        INSERT INTO pendaftaran 
        (nama_lengkap, asal_sekolah, nama_ortu, no_wa, jenjang_pilihan)
        VALUES (?, ?, ?, ?, ?)
    `;

    const values = [nama_lengkap, asal_sekolah, nama_ortu, no_wa, jenjang_pilihan];

    try {
        // Mengganti db.query(..., callback) dengan await db.query(...)
        await db.query(sql, values); 
        res.status(200).send('Pendaftaran Berhasil!');
    } catch (err) {
        console.error("Error Daftar:", err);
        // Di lingkungan promise-based, error ditangkap oleh catch
        return res.status(500).send('Gagal menyimpan data');
    }
});

// =====================
// LOGIN ADMIN (Menggunakan async/await)
// =====================
router.post('/login', async (req, res) => { // Fungsi diubah menjadi async
    const { email, password } = req.body;

    // CATATAN: PENTING! Password harus di-hash (bcrypt/scrypt) di aplikasi nyata.
    // Mengirim password mentah ke DB sangat tidak disarankan!
    if (!email || !password) {
        return res.status(400).send({ message: "Email dan Password wajib diisi." });
    }

    const sql = "SELECT id, nama, email, password FROM admin WHERE email = ?";
    // Tidak menggunakan password di query untuk keamanan, nanti dibandingkan setelah fetch hash
    
    try {
        // Mengganti db.query(..., callback) dengan await db.query(...)
        // Query Promise mengembalikan array [rows, fields]
        const [rows] = await db.query(sql, [email]); 

        if (rows.length === 0) {
            return res.status(401).send({ message: "Email atau Password salah!" });
        }

        const user = rows[0];

        // Membandingkan password (TETAP HARUS DIGANTI dengan perbandingan hash di aplikasi nyata)
        if (user.password !== password) {
             return res.status(401).send({ message: "Email atau Password salah!" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Hapus password dari objek user yang dikirim ke klien
        delete user.password; 

        res.status(200).send({
            message: "Login Berhasil",
            token,
            user
        });

    } catch (err) {
        console.error("Error Login:", err);
        return res.status(500).send({ message: "Database Error" });
    }
});

// Mengekspor router (sudah benar)
export default router;