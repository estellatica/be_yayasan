 // auth.js

import express from 'express';
// Mengimpor db dari file db.js yang baru (promise-based)
import db from '../db.js'; 
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

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
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: "Email dan Password wajib diisi." });
    }

    // Hanya ambil email dan hash password dari database
    const sql = "SELECT id, nama, email, password FROM admin WHERE email = ?"; 

    try {
        const [rows] = await db.query(sql, [email]); 

        if (rows.length === 0) {
            // Penting: Selalu berikan pesan error generik untuk mencegah serangan enumeration
            return res.status(401).send({ message: "Email atau Password salah!" });
        }

        const user = rows[0];
        const hashedPassword = user.password; // Hash password yang disimpan di DB

        // 1. BANDINGKAN PASSWORD: Menggunakan bcrypt.compare
        const isMatch = await bcrypt.compare(password, hashedPassword);

        if (!isMatch) {
             return res.status(401).send({ message: "Email atau Password salah!" });
        }
        
        // --- Jika password cocok, lanjutkan membuat JWT ---

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Hapus hash password sebelum dikirim ke klien
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