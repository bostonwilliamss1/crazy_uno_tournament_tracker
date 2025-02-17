import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import React from "react";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

type Totals = {
  player_name: string;
  player_id: number;
  tournament_id: number;
  total_score: number;
};

interface Props {
  scores: Totals[] | undefined;
}

const PlayerScoreCharts: React.FC<Props> = ({ scores }) => {
  return <div>HeLLO WORLD</div>;
};

export default PlayerScoreCharts;
