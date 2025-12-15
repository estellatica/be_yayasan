// File: routes/auth.js

const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// =====================
// DAFTAR PENDAFTAR
// =====================
router.post('/daftar', (req, res) => {
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

    db.query(sql, values, (err) => {
        if (err) {
            console.error("Error Daftar:", err);
            return res.status(500).send('Gagal menyimpan data');
        }
        res.status(200).send('Pendaftaran Berhasil!');
    });
});

// =====================
// LOGIN ADMIN
// =====================
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ message: "Email dan Password wajib diisi." });
    }

    const sql = "SELECT id, nama, email FROM admin WHERE email = ? AND password = ?";

    db.query(sql, [email, password], (err, result) => {
        if (err) {
            console.error("Error Login:", err);
            return res.status(500).send({ message: "Database Error" });
        }

        if (result.length === 0) {
            return res.status(401).send({ message: "Email atau Password salah!" });
        }

        const user = result[0];

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).send({
            message: "Login Berhasil",
            token,
            user
        });
    });
});

module.exports = router;
