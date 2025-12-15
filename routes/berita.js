const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require("../db");

// ===========================
// SETUP MULTER
// ===========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ===========================
// 1. TAMBAH BERITA (POST)
// ===========================
router.post("/", upload.single("thumbnail"), (req, res) => {
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

  db.query(sql, [judul, kategori, isi, thumbnail, youtube_url], (err, result) => {
    if (err) {
      console.error("ERROR INSERT BERITA:", err);
      return res.status(500).json({ message: "Gagal menyimpan data" });
    }

    res.status(201).json({
      message: "Berita berhasil ditambahkan",
      id: result.insertId,
    });
  });
});

// ===========================
// 2. AMBIL SEMUA BERITA (GET)
// ===========================
router.get("/", (req, res) => {
  const sql = "SELECT * FROM berita ORDER BY id DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("ERROR GET BERITA:", err);
      return res.status(500).json({ message: "Gagal mengambil data" });
    }

    const data = results.map((row) => ({
      ...row,
      thumbnail_url: row.thumbnail
        ? `${process.env.BASE_URL}/uploads/${row.thumbnail}`
        : null,
    }));

    res.json(data);
  });
});

// ===========================
// 3. AMBIL DETAIL BERITA (GET BY ID)
// ===========================
router.get("/:id", (req, res) => {
  const sql = "SELECT * FROM berita WHERE id = ?";

  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error("ERROR GET DETAIL:", err);
      return res.status(500).json({ message: "Gagal mengambil data" });
    }

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
  });
});

// ===========================
// 4. UPDATE BERITA (PUT)
// ===========================
router.put("/:id", upload.single("thumbnail"), (req, res) => {
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

  db.query(sql, data, (err) => {
    if (err) {
      console.error("ERROR UPDATE BERITA:", err);
      return res.status(500).json({ message: "Gagal memperbarui data" });
    }

    res.json({ message: "Berita berhasil diperbarui" });
  });
});

// ===========================
// 5. HAPUS BERITA (DELETE)
// ===========================
router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM berita WHERE id = ?";

  db.query(sql, [req.params.id], (err) => {
    if (err) {
      console.error("ERROR DELETE BERITA:", err);
      return res.status(500).json({ message: "Gagal menghapus data" });
    }

    res.json({ message: "Berita berhasil dihapus" });
  });
});

export default router;
