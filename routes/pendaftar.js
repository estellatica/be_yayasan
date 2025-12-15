import express from 'express';
import multer from 'multer';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js'; // Pastikan db.js menggunakan mysql2/promise
import verifyToken from '../middleware/verifyToken.js'; // Middleware Auth (Wajib ada)

const router = express.Router();

// ==========================================
// SETUP PATH & MULTER
// ==========================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Simpan di folder "uploads" (naik satu level dari folder routes)
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// ==========================================
// 1. POST: KIRIM FORMULIR (PUBLIC)
// ==========================================
// Frontend mengirim: nama, jenisKelamin, jenjang, kategori, noWa, buktiTransfer
router.post("/", upload.single("buktiTransfer"), async (req, res) => {
  try {
    // 1. Tangkap field camelCase dari React
    const { nama, jenisKelamin, jenjang, kategori, noWa } = req.body;

    // 2. Validasi File
    if (!req.file) {
      return res.status(400).json({ message: "Bukti transfer wajib diupload!" });
    }

    // 3. Query Insert (Pastikan nama kolom DB snake_case)
    const sql = `
      INSERT INTO pendaftar 
      (nama, jenis_kelamin, jenjang, kategori, no_wa, bukti_transfer)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
      nama, 
      jenisKelamin, // Masuk ke kolom jenis_kelamin
      jenjang, 
      kategori, 
      noWa,         // Masuk ke kolom no_wa
      req.file.filename
    ];

    await db.query(sql, values);

    res.status(201).json({
      message: "Pendaftaran berhasil dikirim!",
      data: { nama, jenjang, status: "Menunggu" }
    });

  } catch (err) {
    console.error("ERROR POST PENDAFTAR:", err);
    res.status(500).json({ message: "Terjadi kesalahan server saat menyimpan data." });
  }
});

// ==========================================
// 2. GET: AMBIL SEMUA DATA (ADMIN ONLY)
// ==========================================
router.get("/", verifyToken, async (req, res) => {
  try {
    const sql = "SELECT * FROM pendaftar ORDER BY created_at DESC";
    const [rows] = await db.query(sql);

    // Format data agar mudah dibaca frontend
    const formattedData = rows.map(row => ({
      id: row.id,
      nama: row.nama,
      jenis_kelamin: row.jenis_kelamin, // Kirim snake_case sesuai DB
      jenjang: row.jenjang,
      kategori: row.kategori,
      no_wa: row.no_wa,
      status: row.status,
      created_at: row.created_at,
      // Map kolom bukti_transfer ke properti bukti_url
      bukti_url: row.bukti_transfer 
    }));

    res.json(formattedData);
  } catch (err) {
    console.error("ERROR GET ALL:", err);
    res.status(500).json({ message: "Gagal mengambil data." });
  }
});

// ==========================================
// 3. GET: DETAIL DATA (ADMIN ONLY)
// ==========================================
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "SELECT * FROM pendaftar WHERE id = ?";
    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    const data = rows[0];
    
    // Response Detail
    res.json({
      ...data,
      bukti_url: data.bukti_transfer // Sertakan nama file gambar
    });

  } catch (err) {
    console.error("ERROR GET DETAIL:", err);
    res.status(500).json({ message: "Gagal mengambil detail data." });
  }
});

// ==========================================
// 4. PUT: UPDATE STATUS (ADMIN ONLY)
// ==========================================
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "Diterima" | "Ditolak"

    const sql = "UPDATE pendaftar SET status = ? WHERE id = ?";
    await db.query(sql, [status, id]);

    res.json({ message: `Status berhasil diubah menjadi ${status}` });

  } catch (err) {
    console.error("ERROR UPDATE STATUS:", err);
    res.status(500).json({ message: "Gagal update status." });
  }
});

// ==========================================
// 5. DELETE: HAPUS DATA (ADMIN ONLY)
// ==========================================
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Opsional: Hapus file gambarnya juga di sini menggunakan fs.unlink
    // Tapi hapus data di DB saja sudah cukup untuk tahap awal
    
    const sql = "DELETE FROM pendaftar WHERE id = ?";
    await db.query(sql, [id]);

    res.json({ message: "Data pendaftar berhasil dihapus." });

  } catch (err) {
    console.error("ERROR DELETE:", err);
    res.status(500).json({ message: "Gagal menghapus data." });
  }
});

export default router;