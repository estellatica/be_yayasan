// routes/berita.js

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
// SETUP MULTER
// ===========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Pastikan folder 'uploads/' ada di root proyek Anda!
    cb(null, path.join(__dirname, '..', 'uploads')); // Menggunakan path.join dan __dirname yang sudah diperbaiki
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ===========================
// 1. TAMBAH BERITA (POST) - Menggunakan async/await
// ===========================
router.post("/", upload.single("thumbnail"), async (req, res) => { // Ubah fungsi menjadi async
  const { judul, kategori, isi, youtube_url } = req.body;
  const thumbnail = req.file ? req.file.filename : null;

  if (!thumbnail && !youtube_url) {
    return res.status(400).json({
      message: "Wajib upload Thumbnail ATAU isi Link Youtube!",
    });
  }

  const sql = `
    INSERT INTO berita (judul, kategori, isi, thumbnail, youtube_url)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [judul, kategori, isi, thumbnail, youtube_url];

  try {
    // Mengganti db.query(..., callback) dengan await db.query(...)
    const [result] = await db.query(sql, values); 

    res.status(201).json({
      message: "Berita berhasil ditambahkan",
      id: result.insertId,
    });
  } catch (err) {
    console.error("ERROR INSERT BERITA:", err);
    return res.status(500).json({ message: "Gagal menyimpan data" });
  }
});

// ===========================
// 2. AMBIL SEMUA BERITA (GET) - Menggunakan async/await
// ===========================
router.get("/", async (req, res) => { // Ubah fungsi menjadi async
  const sql = "SELECT * FROM berita ORDER BY id DESC";

  try {
    // Mengganti db.query(..., callback) dengan await db.query(...)
    const [results] = await db.query(sql); 

    const data = results.map((row) => ({
      ...row,
      thumbnail_url: row.thumbnail
        ? `${process.env.BASE_URL}/uploads/${row.thumbnail}`
        : null,
    }));

    res.json(data);
  } catch (err) {
    console.error("ERROR GET BERITA:", err);
    return res.status(500).json({ message: "Gagal mengambil data" });
  }
});

// ===========================
// 3. AMBIL DETAIL BERITA (GET BY ID) - Menggunakan async/await
// ===========================
router.get("/:id", async (req, res) => { // Ubah fungsi menjadi async
  const sql = "SELECT * FROM berita WHERE id = ?";

  try {
    // Mengganti db.query(..., callback) dengan await db.query(...)
    const [result] = await db.query(sql, [req.params.id]); 

    if (result.length === 0) {
      return res.status(404).json({ message: "Berita tidak ditemukan" });
    }

    const row = result[0];

    res.json({
      ...row,
      thumbnail_url: row.thumbnail
        ? `${process.env.BASE_URL}/uploads/${row.thumbnail}`
        : null,
    });
  } catch (err) {
    console.error("ERROR GET DETAIL:", err);
    return res.status(500).json({ message: "Gagal mengambil data" });
  }
});

// ===========================
// 4. UPDATE BERITA (PUT) - Menggunakan async/await
// ===========================
router.put("/:id", upload.single("thumbnail"), async (req, res) => { // Ubah fungsi menjadi async
  const { judul, kategori, isi, youtube_url } = req.body;
  const id = req.params.id;

  let sql;
  let data;

  if (req.file) {
    sql = `
      UPDATE berita
      SET judul=?, kategori=?, isi=?, thumbnail=?, youtube_url=?
      WHERE id=?
    `;
    data = [judul, kategori, isi, req.file.filename, youtube_url, id];
  } else {
    sql = `
      UPDATE berita
      SET judul=?, kategori=?, isi=?, youtube_url=?
      WHERE id=?
    `;
    data = [judul, kategori, isi, youtube_url, id];
  }

  try {
    // Mengganti db.query(..., callback) dengan await db.query(...)
    await db.query(sql, data); 

    res.json({ message: "Berita berhasil diperbarui" });
  } catch (err) {
    console.error("ERROR UPDATE BERITA:", err);
    return res.status(500).json({ message: "Gagal memperbarui data" });
  }
});

// ===========================
// 5. HAPUS BERITA (DELETE) - Menggunakan async/await
// ===========================
router.delete("/:id", async (req, res) => { // Ubah fungsi menjadi async
  const sql = "DELETE FROM berita WHERE id = ?";

  try {
    // Mengganti db.query(..., callback) dengan await db.query(...)
    await db.query(sql, [req.params.id]); 
    
    res.json({ message: "Berita berhasil dihapus" });
  } catch (err) {
    console.error("ERROR DELETE BERITA:", err);
    return res.status(500).json({ message: "Gagal menghapus data" });
  }
});

// Mengekspor router (sudah benar)
export default router;