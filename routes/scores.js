import express from "express";
import db from "../models/db.js";

const router = express.Router();

router.get("/totals", async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        p.name AS player_name, 
        s.player_id, 
        s.tournament_id, 
        SUM(s.score) AS total_score
      FROM scores s
      JOIN players p ON s.player_id = p.id
      GROUP BY s.tournament_id, s.player_id
      ORDER BY s.tournament_id, total_score DESC;
    `);
    res.json(results);
  } catch (err) {
    console.error("Error retrieving tournament totals:", err);
    res.status(500).send("Error retrieving data");
  }
});

router.post("/scores", async (req, res) => {
  const db = req.app.get("db");
  const scores = req.body;

  try {
    const values = scores.map(
      ({ tournament_id, player_id, round_number, score }) => [
        player_id,
        round_number,
        score,
        tournament_id,
      ]
    );

    await db.query(
      `INSERT INTO scores (player_id, round_number, score, tournament_id)
       VALUES ?`,
      [values]
    );

    res.status(201).json({ message: "Scores inserted." });
  } catch (error) {
    console.error("Error inserting scores:", error);
    res.status(500).json({ error: "Failed to insert scores." });
  }
});

export default router;
