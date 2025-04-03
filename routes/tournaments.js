import express from "express";
import db from "../models/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
    SELECT tournament_id, title, year, winner_id, round_count
    FROM tournaments
    ORDER BY year DESC;
  `);

    const tournaments = rows.map((t) => ({
      tournamentId: t.tournament_id,
      title: t.title,
      year: t.year,
      winner: t.winner_id,
      roundCount: t.round_count,
    }));

    res.json(tournaments);
  } catch (err) {
    console.error("Error retrieving tournaments:", err);
    res.status(500).send("Error retrieving tournaments");
  }
});

router.post("/tournaments", async (req, res) => {
  const db = req.app.get("db"); // assuming db is attached to app
  const { tournament_id, title, year, winner_id, round_count } = req.body;

  try {
    await db.query(
      `INSERT INTO tournaments (tournament_id, title, year, winner_id, round_count)
       VALUES (?, ?, ?, ?, ?)`,
      [tournament_id, title, year, winner_id, round_count]
    );

    res.status(201).json({ message: "Tournament created successfully." });
  } catch (error) {
    console.error("Error inserting tournament:", error);
    res.status(500).json({ error: "Failed to insert tournament." });
  }
});

router.post("/full", async (req, res) => {
  const db = req.app.get("db");
  const { tournament, players, tournamentPlayers, scores } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const playerValues = players.map(() => `(?, ?)`).join(", ");
    const playerParams = players.flatMap((p) => [p.id, p.name]);

    await conn.query(
      `INSERT INTO players (id, name) VALUES ${playerValues}
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      playerParams
    );

    await conn.query(
      `INSERT INTO tournaments (tournament_id, title, year, winner_id, round_count)
       VALUES (?, ?, ?, ?, ?)`,
      [
        tournament.tournament_id,
        tournament.title,
        tournament.year,
        tournament.winner_id,
        tournament.round_count,
      ]
    );

    const tpValues = tournamentPlayers.map(() => `(?, ?)`).join(", ");
    const tpParams = tournamentPlayers.flatMap((tp) => [
      tp.tournament_id,
      tp.player_id,
    ]);

    await conn.query(
      `INSERT INTO tournament_players (tournament_id, player_id)
       VALUES ${tpValues}`,
      tpParams
    );

    // 4. Insert scores
    const scoreValues = scores.map(() => `(?, ?, ?, ?)`).join(", ");
    const scoreParams = scores.flatMap((s) => [
      s.player_id,
      s.round_number,
      s.score,
      s.tournament_id,
    ]);

    await conn.query(
      `INSERT INTO scores (player_id, round_number, score, tournament_id)
       VALUES ${scoreValues}`,
      scoreParams
    );

    await conn.commit();
    res.status(201).json({ message: "Tournament fully recorded." });
  } catch (err) {
    await conn.rollback();
    console.error("Tournament transaction failed:", err);
    res.status(500).json({ error: "Failed to save tournament data." });
  } finally {
    conn.release();
  }
});

export default router;
