import mysql from "mysql2/promise";

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

try {
  await db.connect();
  console.log("✅ DB connected");
} catch (err) {
  console.error("❌ Gagal konek DB full:", err);
}


module.exports = db;
