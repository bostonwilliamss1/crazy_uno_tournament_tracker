import axios from "axios";
import { useEffect, useState } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tournament } from "@/models/Tournament";

function PlayerStats() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [maxScores, setMaxScores] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/tournament-players")
      .then((response) => {
        setTournaments(response.data);
      })
      .catch((error) => {
        console.error("Error fetching tournament players:", error);
      });
  }, []);

  useEffect(() => {
    if (tournaments.length > 0) {
      setMaxScores((prevMaxScores) => {
        const newMaxScores = new Map(prevMaxScores);

        tournaments.forEach((tournament) => {
          Object.values(tournament.people).forEach((player) => {
            Object.values(player.rounds).forEach((round) => {
              if (round) {
                const currentScore = newMaxScores.get(player.name) || 0;
                if (round > currentScore) {
                  newMaxScores.set(player.name, round);
                }
              }
            });
          });
        });
        return newMaxScores;
      });
    }
  }, [tournaments]);

  return (
    <div className="chart-container">
      <CardHeader>
        <CardTitle>Players Highest Scores</CardTitle>
      </CardHeader>
      <CardContent>
        {Array.from(maxScores.entries()).map(([playerName, maxScore]) => (
          <div className="text-gray-700 text-sm my-1" key={playerName}>
            {playerName}: <span className="font-bold">{maxScore}</span>
          </div>
        ))}
      </CardContent>
    </div>
  );
}

export default PlayerStats;
