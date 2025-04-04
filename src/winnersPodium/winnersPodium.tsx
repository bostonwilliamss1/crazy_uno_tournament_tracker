import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function WinnersPodium() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const topPlayers = state?.topPlayers || [];
  console.log("topPlayers", topPlayers);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 to-purple-200">
      <h1 className="text-4xl font-bold mb-6">🏆 Tournament Podium 🏆</h1>
      <div className="flex gap-4 items-end">
        {topPlayers.map((player: any, index: number) => (
          <div key={player.player_name} className="text-center">
            <div
              className={`bg-white shadow-lg p-4 rounded-lg ${
                index === 0 ? "text-3xl" : "text-xl"
              }`}
            >
              <p className="font-bold">{player.player_name}</p>
              <p>{player.total_score} pts</p>
              <p>{["🥇", "🥈", "🥉"][index]}</p>
            </div>
          </div>
        ))}
      </div>

      <Button
        className="mt-8 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
        onClick={() => navigate("/alternateHomePage")}
      >
        Go to Home
      </Button>
    </div>
  );
}
export default WinnersPodium;
