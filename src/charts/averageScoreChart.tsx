import { Tournament } from "@/models/Tournament";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Props {
  tournament: Tournament | undefined;
}

const AverageScoreChart: React.FC<Props> = ({ tournament }) => {
  if (!tournament) return;

  const averageScores = Object.values(tournament.people).map((player) => {
    const scores = Object.values(player.rounds);
    const totalScore = scores.reduce((a, b) => a + b, 0);
    const averageScore = totalScore / scores.length;
    return averageScore;
  });

  const data = {
    labels: Object.values(tournament.people).map((player) => player.name),
    datasets: [
      {
        data: averageScores,
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
  return <Bar data={data} options={options}></Bar>;
};

export default AverageScoreChart;
