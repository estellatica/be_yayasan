// routes/pendaftar.js

import express from 'express';
import multer from 'multer'; // Ganti const multer = require("multer");
import path, { dirname } from 'path'; // Ganti const path = require("path");
import { fileURLToPath } from 'url'; // Untuk mendapatkan __dirname
import db from '../db.js'; // Ganti const db = require("../db");

const router = express.Router();

// **ES MODULE FIX**: Mendefinisikan ulang __dirname dan __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ===========================
// SETUP MULTER (BUKTI TRANSFER)
// ===========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Menggunakan path.join dan __dirname yang sudah diperbaiki
    cb(null, path.join(__dirname, '..', 'uploads')); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ===========================
// 1. SIMPAN PENDAFTARAN (POST) - Menggunakan async/await
// ===========================
router.post("/", upload.single("buktiTransfer"), async (req, res) => { // Ubah fungsi menjadi async
  const { nama, jenisKelamin, jenjang, kategori, noWa } = req.body;

  if (!req.file) {
    return res
      .status(400)
      .json({ message: "Bukti transfer wajib diupload!" });
  }

  const buktiTransfer = req.file.filename;

  const sql = `
    INSERT INTO pendaftar 
    (nama, jenis_kelamin, jenjang, kategori, no_wa, bukti_transfer)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [nama, jenisKelamin, jenjang, kategori, noWa, buktiTransfer];
  
  try {
    // Mengganti db.query(..., callback) dengan await db.query(...)
    await db.query(sql, values); 
    
    res.status(201).json({
      message: "Pendaftaran berhasil dikirim!",
    });
  } catch (err) {
    console.error("ERROR INSERT PENDAFTAR:", err);
    return res.status(500).json({ message: "Gagal menyimpan data" });
  }
});

// ===========================
// 2. AMBIL SEMUA PENDAFTAR (ADMIN) - Menggunakan async/await
// ===========================
router.get("/", async (req, res) => { // Ubah fungsi menjadi async
  const sql = "SELECT * FROM pendaftar ORDER BY created_at DESC";

  try {
    // Mengganti db.query(..., callback) dengan await db.query(...)
    const [results] = await db.query(sql); 
    
    const data = results.map((row) => ({
      ...row,
      bukti_url: row.bukti_transfer
        ? `${process.env.BASE_URL}/uploads/${row.bukti_transfer}`
        : null,
    }));

    res.json(data);
  } catch (err) {
    console.error("ERROR GET PENDAFTAR:", err);
    return res.status(500).json({ message: "Gagal mengambil data" });
  }
});

// ===========================
// 3. AMBIL DETAIL PENDAFTAR - Menggunakan async/await
// ===========================
router.get("/:id", async (req, res) => { // Ubah fungsi menjadi async
  const sql = "SELECT * FROM pendaftar WHERE id = ?";

  try {
    // Mengganti db.query(..., callback) dengan await db.query(...)
    const [result] = await db.query(sql, [req.params.id]); 

    if (result.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const data = result[0];

    res.json({
      ...data,
      bukti_url: data.bukti_transfer
        ? `${process.env.BASE_URL}/uploads/${data.bukti_transfer}`
        : null,
    });
  } catch (err) {
    return res.status(500).json({ message: "Gagal mengambil data" });
  }
});

// ===========================
// 4. UPDATE STATUS PENDAFTAR - Menggunakan async/await
// ===========================
router.put("/:id", async (req, res) => { // Ubah fungsi menjadi async
  const { status } = req.body;

  const sql = "UPDATE pendaftar SET status = ? WHERE id = ?";

  try {
    // Mengganti db.query(..., callback) dengan await db.query(...)
    await db.query(sql, [status, req.params.id]); 
    
    res.json({ message: "Status berhasil diperbarui" });
  } catch (err) {
    return res.status(500).json({ message: "Gagal update status" });
  }
});

// ===========================
// 5. HAPUS PENDAFTAR - Menggunakan async/await
// ===========================
router.delete("/:id", async (req, res) => { // Ubah fungsi menjadi async
  const sql = "DELETE FROM pendaftar WHERE id = ?";

  try {
    // Mengganti db.query(..., callback) dengan await db.query(...)
    await db.query(sql, [req.params.id]); 
    
    res.json({ message: "Data berhasil dihapus" });
  } catch (err) {
    return res.status(500).json({ message: "Gagal menghapus data" });
  }
});

// Mengekspor router (sudah benar)
export default router;