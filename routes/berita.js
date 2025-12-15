const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const db = require("../db");

// --- SETUP MULTER ---
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
  // 1. Ambil youtube_url dari body
  const { judul, kategori, isi, youtube_url } = req.body; 
  
  // 2. Cek apakah ada file upload
  const thumbnail = req.file ? req.file.filename : null;

  // 3. VALIDASI BARU: 
  // Error jika tidak ada gambar DAN tidak ada link youtube (dua-duanya kosong)
  if (!thumbnail && !youtube_url) {
    return res.status(400).json({ message: "Wajib upload Thumbnail ATAU isi Link Youtube!" });
  }

  // 4. Update SQL: Tambahkan kolom youtube_url
  const sql = `INSERT INTO berita (judul, kategori, isi, thumbnail, youtube_url) VALUES (?, ?, ?, ?, ?)`;

  db.query(sql, [judul, kategori, isi, thumbnail, youtube_url], (err, result) => {
    if (err) {
      console.error("ERROR INSERT:", err);
      return res.status(500).json({ message: "Gagal simpan ke database", error: err });
    }
    res.json({ message: "Berita berhasil ditambahkan", data: result });
  });
});

// ===========================
// 2. AMBIL SEMUA BERITA (GET)
// ===========================
router.get("/", (req, res) => {
  const sql = "SELECT * FROM berita ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });

    const data = results.map((row) => ({
      ...row,
      thumbnail_url: row.thumbnail 
        ? `http://localhost:5000/uploads/${row.thumbnail}` 
        : null,
    }));

    res.json(data);
  });
});

// ===========================
// 3. AMBIL DETAIL (GET BY ID)
// ===========================
router.get("/:id", (req, res) => {
  const sql = "SELECT * FROM berita WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ message: "Berita tidak ditemukan" });

    const row = result[0];
    res.json({
      ...row,
      thumbnail_url: row.thumbnail 
        ? `http://localhost:5000/uploads/${row.thumbnail}` 
        : null,
    });
  });
});

// ===========================
// 4. UPDATE BERITA (PUT)
// ===========================
router.put("/:id", upload.single("thumbnail"), (req, res) => {
  // 1. Ambil youtube_url
  const { judul, kategori, isi, youtube_url } = req.body;
  const id = req.params.id;

  let sql, data;

  // 2. Cek Logika Update
  if (req.file) {
    // KASUS A: User upload gambar baru
    // Update Judul, Kategori, Isi, Youtube, DAN Thumbnail
    sql = `UPDATE berita SET judul=?, kategori=?, isi=?, thumbnail=?, youtube_url=? WHERE id=?`;
    data = [judul, kategori, isi, req.file.filename, youtube_url, id];
  } else {
    // KASUS B: User TIDAK upload gambar (hanya ganti teks/link)
    // Update Judul, Kategori, Isi, Youtube saja. Thumbnail lama jangan diganti.
    sql = `UPDATE berita SET judul=?, kategori=?, isi=?, youtube_url=? WHERE id=?`;
    data = [judul, kategori, isi, youtube_url, id];
  }

  db.query(sql, data, (err, result) => {
    if (err) {
        console.error("ERROR UPDATE:", err); // Debugging
        return res.status(500).json({ error: err });
    }
    res.json({ message: "Berita berhasil diperbarui" });
  });
});

// ===========================
// 5. HAPUS BERITA (DELETE)
// ===========================
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM berita WHERE id=?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Berita berhasil dihapus" });
  });
});

module.exports = router;