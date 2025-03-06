// not currently being used anywhere

import { useEffect, useState } from "react";
import axios from "axios";
import { Person } from "../models/Person";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    console.log("players", players);
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/scores")
      .then((response) => setScores(response.data))
      .catch((error) => console.error("Error fetching scores:", error));
    console.log("scores", scores);
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
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Most Recent Tournament</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-1.5">
            <Players />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Players;
