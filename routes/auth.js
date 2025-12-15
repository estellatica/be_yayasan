// File: routes/auth.js

const express = require('express');
const router = express.Router();
const db = require('../db'); // Asumsi db.js ada di level yang sama dengan app.js

// CREATE PENDAFTAR (Route: POST /api/daftar)
router.post('/daftar', (req, res) => {
    const { nama_lengkap, asal_sekolah, nama_ortu, no_wa, jenjang_pilihan } = req.body;
    
    // Tambahkan validasi dasar
    if (!nama_lengkap || !no_wa) {
        return res.status(400).send('Nama lengkap dan No. WA wajib diisi.');
    }

    const sql = `INSERT INTO pendaftaran 
        (nama_lengkap, asal_sekolah, nama_ortu, no_wa, jenjang_pilihan)
        VALUES (?, ?, ?, ?, ?)`;

    const values = [nama_lengkap, asal_sekolah, nama_ortu, no_wa, jenjang_pilihan];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Error Daftar:", err);
            return res.status(500).send('Gagal menyimpan data');
        }
        res.status(200).send('Pendaftaran Berhasil!');
    });
});

// LOGIN ADMIN (Route: POST /api/login)
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Tambahkan validasi dasar
    if (!email || !password) {
        return res.status(400).send({ message: "Email dan Password wajib diisi." });
    }

    // CATATAN: Pada produksi, password harus di-hash (bcrypt)
    const sql = "SELECT id, nama, email FROM admin WHERE email = ? AND password = ?";
    
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            console.error("Error Login:", err);
            return res.status(500).send({ message: "Database Error" });
        }
        
        if (result.length > 0) {
            const user = result[0];
            res.status(200).send({
                message: "Login Berhasil",
                user: { id: user.id, nama: user.nama, email: user.email }
            });
        } else {
            res.status(401).send({ message: "Email atau Password Salah!" });
        }
    });
});

module.exports = router;