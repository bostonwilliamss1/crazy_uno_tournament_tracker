import express from "express";
import db from "../models/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [players] = await db.query(`
      SELECT id, name 
      FROM players 
      ORDER BY name;
    `);
    res.json(players);
  } catch (err) {
    console.error("Error retrieving players:", err);
    res.status(500).send("Database error");
  }
});

router.post("/players", async (req, res) => {
  const db = req.app.get("db");
  const newPlayers = req.body;

  try {
    if (!Array.isArray(newPlayers) || newPlayers.length === 0) {
      return res.status(400).json({ error: "No players provided." });
    }

    const isPostgres = true;

    if (isPostgres) {
      const values = newPlayers
        .map((p, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
        .join(", ");
      const params = newPlayers.flatMap((p) => [p.id, p.name]);

      await db.query(
        `INSERT INTO players (id, name) VALUES ${values}
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`,
        params
      );
    } else {
      const values = newPlayers.map((p) => [p.id, p.name]);
      await db.query(
        `INSERT INTO players (id, name) VALUES ? 
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [values]
      );
    }

    res.status(201).json({ message: "Players inserted or updated." });
  } catch (error) {
    console.error("Error upserting players:", error);
    res.status(500).json({ error: "Failed to insert or update players." });
  }
});

export default router;
