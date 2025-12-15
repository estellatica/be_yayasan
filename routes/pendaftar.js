const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");

// ===========================
// SETUP MULTER (BUKTI TRANSFER)
// ===========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ===========================
// 1. SIMPAN PENDAFTARAN (POST)
// ===========================
router.post("/", upload.single("buktiTransfer"), (req, res) => {
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

  db.query(
    sql,
    [nama, jenisKelamin, jenjang, kategori, noWa, buktiTransfer],
    (err) => {
      if (err) {
        console.error("ERROR INSERT PENDAFTAR:", err);
        return res.status(500).json({ message: "Gagal menyimpan data" });
      }

      res.status(201).json({
        message: "Pendaftaran berhasil dikirim!",
      });
    }
  );
});

// ===========================
// 2. AMBIL SEMUA PENDAFTAR (ADMIN)
// ===========================
router.get("/", (req, res) => {
  const sql = "SELECT * FROM pendaftar ORDER BY created_at DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("ERROR GET PENDAFTAR:", err);
      return res.status(500).json({ message: "Gagal mengambil data" });
    }

    const data = results.map((row) => ({
      ...row,
      bukti_url: row.bukti_transfer
        ? `${process.env.BASE_URL}/uploads/${row.bukti_transfer}`
        : null,
    }));

    res.json(data);
  });
});

// ===========================
// 3. AMBIL DETAIL PENDAFTAR
// ===========================
router.get("/:id", (req, res) => {
  const sql = "SELECT * FROM pendaftar WHERE id = ?";

  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Gagal mengambil data" });
    }

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
  });
});

// ===========================
// 4. UPDATE STATUS PENDAFTAR
// ===========================
router.put("/:id", (req, res) => {
  const { status } = req.body;

  const sql = "UPDATE pendaftar SET status = ? WHERE id = ?";

  db.query(sql, [status, req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ message: "Gagal update status" });
    }

    res.json({ message: "Status berhasil diperbarui" });
  });
});

// ===========================
// 5. HAPUS PENDAFTAR
// ===========================
router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM pendaftar WHERE id = ?";

  db.query(sql, [req.params.id], (err) => {
    if (err) {
      return res.status(500).json({ message: "Gagal menghapus data" });
    }

    res.json({ message: "Data berhasil dihapus" });
  });
});

module.exports = router;
