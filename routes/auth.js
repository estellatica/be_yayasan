import express from 'express';
// import bcrypt from 'bcryptjs'; // Aktifkan jika sudah pakai hash
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        // TERIMA EMAIL & PASSWORD
        const { email, password } = req.body; 

        // 1. Cek User berdasarkan EMAIL
        const sql = "SELECT * FROM admin WHERE email = ?";
        const [rows] = await db.query(sql, [email]);

        // Jika email tidak ditemukan
        if (rows.length === 0) {
            return res.status(404).json({ message: "Email tidak terdaftar" });
        }

        const user = rows[0];

        // 2. Cek Password 
        // (Gunakan bcrypt.compare jika password sudah di-hash)
        // const isMatch = await bcrypt.compare(password, user.password);
        
        // SEMENTARA (Plain Text) sesuai request sebelumnya:
        const isMatch = (password === user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Password salah" });
        }

        // 3. Buat Token
        const token = jwt.sign(
            { id: user.id, email: user.email }, // Simpan email di token
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: "Login berhasil",
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
});

export default router;