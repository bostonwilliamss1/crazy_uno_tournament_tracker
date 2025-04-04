import express from "express";
import db from "../models/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const query = `
    SELECT 
        t.tournament_id,
        t.title AS tournament_name,
        t.year AS tournament_year,
        p.id AS player_id,
        p.name AS player_name,
        s.round_number,
        s.score
    FROM tournament_players tp
    JOIN tournaments t ON tp.tournament_id = t.tournament_id
    JOIN players p ON tp.player_id = p.id
    LEFT JOIN scores s ON s.tournament_id = t.tournament_id AND s.player_id = p.id
    ORDER BY t.tournament_id, p.id, s.round_number;
  `;

  try {
    const [results] = await db.query(query);
    const tournaments = {};

    results.forEach((row) => {
      const {
        tournament_id,
        tournament_name,
        tournament_year,
        player_id,
        player_name,
        round_number,
        score,
      } = row;

      if (!tournaments[tournament_id]) {
        tournaments[tournament_id] = {
          title: tournament_name,
          year: tournament_year,
          people: {},
          tournamentId: tournament_id,
          completed: true,
        };
      }

      if (!tournaments[tournament_id].people[player_id]) {
        tournaments[tournament_id].people[player_id] = {
          name: player_name,
          id: player_id,
          rounds: {},
        };
      }

      if (round_number !== null) {
        tournaments[tournament_id].people[player_id].rounds[round_number] =
          score;
      }
    });

    res.json(Object.values(tournaments));
  } catch (err) {
    console.error("Database Query Error:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
});

router.post("/tournament-players", async (req, res) => {
  const db = req.app.get("db");
  const players = req.body; // array of { tournament_id, player_id }

  try {
    const values = players.map(({ tournament_id, player_id }) => [
      tournament_id,
      player_id,
    ]);

    await db.query(
      `INSERT INTO tournament_players (tournament_id, player_id)
       VALUES ?`,
      [values] // batch insert
    );

    res.status(201).json({ message: "Tournament players added." });
  } catch (error) {
    console.error("Error inserting tournament players:", error);
    res.status(500).json({ error: "Failed to insert tournament players." });
  }
});

export default router;
