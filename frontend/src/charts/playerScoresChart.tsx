import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Totals } from "@/models/Totals";
import React from "react";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Props {
  scores: Totals[] | undefined;
}

const PlayerScoreCharts: React.FC<Props> = ({ scores }) => {
  const data = {
    labels: scores?.map((score) => score.player_name),
    datasets: [
      {
        data: scores?.map((score) => score.total_score),
        backgroundColor: [
          "rgba(0, 72, 255, 0.8)",
          "rgba(0, 179, 0, 0.8)",
          "rgba(255, 118, 0, 0.8)",
          "rgba(255, 0, 0, 0.8)",
          "rgba(231, 231, 0, 0.8)",
          "rgba(166, 0, 255, 0.8)",
          "rgba(239, 93, 91, 0.8)",
        ],
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: { beginAtZero: true },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default PlayerScoreCharts;
