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

  if (!scores || !tournaments.length) {
    return null;
  }

  const wins: Map<string, number> = new Map();

  tournaments.forEach((tournament) => {
    const winnerId = Number(tournament.winner);

    const winnerInfo = scores.find(
      (score) =>
        score.player_id === winnerId &&
        score.tournament_id === tournament.tournamentId
    );

    if (winnerInfo) {
      const currentWins = wins.get(winnerInfo.player_name) || 0;
      wins.set(winnerInfo.player_name, currentWins + 1);
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

  return (
    <div style={{ width: "300px", height: "200px" }}>
      <Doughnut className="w-10" data={data} options={options} />
    </div>
  );
};

export default WinsChart;
