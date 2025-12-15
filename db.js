// File: db.js (VERSI PERBAIKAN UNTUK HOSTINGER)

const mysql = require("mysql2");

// Ambil kredensial dari Environment Variables yang diatur di hPanel
const db = mysql.createConnection({
  host: process.env.DB_HOST,      // Harus diisi 'localhost' di hPanel
  user: process.env.DB_USER,      // Harus diisi 'u159260889_yayasan_db' di hPanel
  password: process.env.DB_PASSWORD, // Harus diisi Password Anda di hPanel
  database: process.env.DB_NAME,    // Harus diisi 'u159260889_yayasan_db' di hPanel
  // Port tidak perlu disertakan, biarkan MySQL default (3306)
});

db.connect((err) => {
  if (err) {
      // Di sini error akan mencatat kegagalan, yang akan terlihat di Log Hostinger
      console.error("❌ Gagal Konek Database:", err);
  } else {
      console.log("✅ MySQL Connected...");
  }
});

module.exports = db;