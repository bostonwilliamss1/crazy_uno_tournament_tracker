import "dotenv/config";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "peanut@4",
  database: process.env.DB_DATABASE || "uno_tournament",
});

export default pool;
