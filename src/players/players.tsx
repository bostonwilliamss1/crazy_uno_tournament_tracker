// Updated Players.tsx with Tailwind
import { useEffect, useState } from "react";
import axios from "axios";
import { Person } from "../models/Person";

type Score = {
  player_id: number;
  total_score: number;
};

const Players = () => {
  const [players, setPlayers] = useState<Person[]>([]);
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/players")
      .then((response) => {
        setPlayers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching players:", error);
      });
  }, [players]);

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/scores")
      .then((response) => setScores(response.data))
      .catch((error) => console.error("Error fetching scores:", error));
  }, [scores]);

  return (
    <div className="w-full flex flex-col">
      <div className="flex justify-between text-lg font-bold">
        <h3>Players</h3>
        <h3>Scores</h3>
      </div>
      <div className="w-full flex flex-col">
        {players.map((player) => {
          const playerScore = scores.find(
            (score) => score.player_id === player.id
          );
          return (
            <div
              className="flex justify-between p-2 border-b border-gray-400"
              key={player.id}
            >
              <span>{player.name}</span>
              <span>{playerScore ? playerScore.total_score : 0}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Players;
