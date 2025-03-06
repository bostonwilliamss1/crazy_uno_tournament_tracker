import { Tournament } from "@/models/Tournament";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type Totals = {
  player_name: string;
  player_id: number;
  tournament_id: number;
  total_score: number;
};

interface Props {
  scores: Totals[] | undefined;
}

const WinsChart: React.FC<Props> = ({ scores = [] }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  if (!scores) return;
  const wins: Map<string, number> = new Map();
  tournaments.forEach((_, i) => {
    const tournamentInfo = scores.filter(
      (score) => score.tournament_id === i + 1
    );
    if (tournamentInfo.length > 0) {
      const lowestScorePlayer = tournamentInfo.reduce(
        (minPlayer, currentPlayer) =>
          currentPlayer.total_score < minPlayer.total_score
            ? currentPlayer
            : minPlayer
      );
      const currentWins = wins.get(lowestScorePlayer.player_name) || 0;
      wins.set(lowestScorePlayer.player_name, currentWins + 1);
    }
  });

  const data = {
    labels: [...wins.keys()],
    datasets: [
      {
        label: "Number of Wins",
        data: [...wins.values()],
        backgroundColor: [
          "rgba(0, 72, 255, 0.8)",
          "rgba(0, 179, 0, 0.8)",
          "rgba(255, 118, 0, 0.8)",
          "rgba(255, 0, 0, 0.8)",
          "rgba(231, 231, 0, 0.8)",
          "rgba(166, 0, 255, 0.8)",
          "rgba(239, 93, 91, 0.8)",
        ],
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/tournaments")
      .then((response) => {
        setTournaments(response.data);
      })
      .catch((error) => {
        console.error("Error fetching tournament titles:", error);
      });
  }, []);

  return <Doughnut data={data} options={options} />;
};

export default WinsChart;
