import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./models/db.js";
import tournamentsRoutes from "./routes/tournaments.js";
import scoresRoutes from "./routes/scores.js";
import playersRoutes from "./routes/players.js";
import tournamentPlayersRouter from "./routes/tournament-players.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.set("db", db);

app.use("/api/tournaments", tournamentsRoutes);
app.use("/api/scores", scoresRoutes);
app.use("/api/players", playersRoutes);
app.use("/api/tournament-players", tournamentPlayersRouter);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
