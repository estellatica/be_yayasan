const express = require('express');
const router = express.Router();
const db = require('../db'); 

// GET SEMUA PENDAFTAR (Route: GET /api/pendaftar)
router.get('/', (req, res) => {
    const sql = "SELECT * FROM pendaftaran ORDER BY tanggal_daftar DESC";
    
    db.query(sql, (err, result) => {
        if (err) {
            console.error("Error Get Pendaftar:", err);
            return res.status(500).send('Gagal mengambil data');
        }
        res.status(200).json(result);
    });
});

// --- SETUP MULTER (UPLOAD BUKTI TRANSFER) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Nama file: timestamp-namadepan.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// ===========================
// 1. SIMPAN PENDAFTARAN (POST)
// ===========================
router.post("/", upload.single("buktiTransfer"), (req, res) => {
  const { nama, jenisKelamin, jenjang, kategori, noWa } = req.body;
  
  // Validasi sederhana
  if (!req.file) {
    return res.status(400).json({ message: "Bukti transfer wajib diupload!" });
  }

  const buktiTransfer = req.file.filename;

  const sql = `INSERT INTO pendaftar (nama, jenis_kelamin, jenjang, kategori, no_wa, bukti_transfer) VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [nama, jenisKelamin, jenjang, kategori, noWa, buktiTransfer], (err, result) => {
    if (err) {
      console.error("Error Simpan Pendaftar:", err);
      return res.status(500).json({ message: "Gagal menyimpan data", error: err });
    }
    res.status(200).json({ message: "Pendaftaran berhasil dikirim!" });
  });
});

// ===========================
// 2. AMBIL DATA PENDAFTAR (GET - UNTUK ADMIN)
// ===========================
router.get("/", (req, res) => {
  const sql = "SELECT * FROM pendaftar ORDER BY created_at DESC";
  
  db.query(sql, (err, results) => {
    if (err) {
        return res.status(500).json({ error: err });
    }
    
    // Format URL gambar bukti transfer
    const data = results.map(row => ({
        ...row,
        bukti_url: `http://localhost:5000/uploads/${row.bukti_transfer}`
    }));

    res.json(data);
  });
});

// ===========================
// 3. AMBIL DETAIL SATU PENDAFTAR (GET /:id)
// ===========================
router.get("/:id", (req, res) => {
  const sql = "SELECT * FROM pendaftar WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.length === 0) return res.status(404).json({ message: "Data tidak ditemukan" });

    const data = result[0];
    // Tambahkan URL gambar
    data.bukti_url = `http://localhost:5000/uploads/${data.bukti_transfer}`;
    
    res.json(data);
  });
});

// ===========================
// 4. UPDATE STATUS PENDAFTAR (PUT /:id)
// ===========================
// Contoh: Mengubah status jadi "Diterima" atau "Ditolak"
router.put("/:id", (req, res) => {
  const { status } = req.body; // Mengambil status baru dari body
  const sql = "UPDATE pendaftar SET status = ? WHERE id = ?";
  
  db.query(sql, [status, req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Status berhasil diperbarui" });
  });
});

// ===========================
// 5. HAPUS PENDAFTAR (DELETE)
// ===========================
router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM pendaftar WHERE id = ?";
  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Data berhasil dihapus" });
  });
});

module.exports = router;