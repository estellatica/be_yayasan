// db.js

import mysql from 'mysql2/promise'; // Menggunakan promise-based API
// Catatan: Anda tidak perlu mengimpor dotenv di sini jika sudah diimpor di index.js

const db = mysql.createPool({ // Menggunakan createPool lebih baik untuk aplikasi web
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3307,
});

try {
  // Tes koneksi (dengan async/await di top-level)
  const connection = await db.getConnection();
  connection.release(); // Melepaskan koneksi setelah tes
  console.log("✅ DB connected successfully!");
} catch (err) {
  console.error("❌ Gagal konek DB:", err.message);
  // Opsional: Anda bisa keluar dari aplikasi jika koneksi database kritis
  // process.exit(1); 
}

// Mengekspor objek pool koneksi agar bisa digunakan di file lain
export default db;