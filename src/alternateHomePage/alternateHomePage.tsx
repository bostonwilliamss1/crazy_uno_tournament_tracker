import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlayerStats from "@/playerStats/PlayerStats";
import ZeroStats from "@/zeroStats/zeroStats";
import axios from "axios";
import { useEffect, useState } from "react";

interface WinnerData {
  name: string;
  title: string;
  score: number;
}

function AlternateHomePage() {
  const [recentWinner, setRecentWinner] = useState<WinnerData | null>(null);
  const [recentLoser, setRecentLoser] = useState<WinnerData | null>(null);

  useEffect(() => {
    let latestTournamentId: number | null = null;
    let latestTournamentTitle: string | null = null;

    axios
      .get("http://localhost:5001/api/tournaments")
      .then((response) => {
        if (response.data.length === 0) {
          console.warn("No tournaments found.");
          setRecentWinner(null);
          return;
        }

        const latestTournament = response.data[0];
        latestTournamentId = latestTournament.tournament_id;
        latestTournamentTitle = latestTournament.title;

        return axios.get("http://localhost:5001/api/scores/totals");
      })
      .then((response) => {
        if (!response || response.data.length === 0) {
          console.warn("No score data found.");
          setRecentWinner(null);
          return;
        }

        interface TournamentScore {
          player_name: string;
          player_id: number;
          tournament_id: number;
          total_score: number;
        }
        const latestTournamentScores = response.data.filter(
          (entry: TournamentScore) => entry.tournament_id === latestTournamentId
        );

        if (latestTournamentScores.length === 0) {
          console.warn("No players found in the latest tournament.");
          setRecentWinner(null);
          setRecentLoser(null);
          return;
        }

        latestTournamentScores.sort(
          (a: TournamentScore, b: TournamentScore) =>
            a.total_score - b.total_score
        );

        const winner = latestTournamentScores[0];
        const loser = latestTournamentScores[latestTournamentScores.length - 1];

        setRecentWinner({
          name: winner.player_name,
          title: latestTournamentTitle!,
          score: winner.total_score,
        });

        setRecentLoser({
          name: loser.player_name,
          title: latestTournamentTitle!,
          score: loser.total_score,
        });
      })
      .catch((error) => {
        console.error("Error fetching tournaments or scores:", error);
      });
  }, []);

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen p-6 w-full">
      {/* Stats & Rules Section - Organized Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {/* Player Statistics */}
        <div className="bg-white shadow-lg rounded-lg p-4 transition-transform duration-500 ease-in-out transform hover:scale-105">
          <CardHeader>
            <CardTitle className="text-xl font-bold animate-fade-in">
              👤 Player Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PlayerStats />
          </CardContent>
        </div>

        {/* Tournament Statistics */}
        <div className="bg-white shadow-lg rounded-lg p-4 transition-transform duration-500 ease-in-out transform hover:scale-105">
          <CardHeader>
            <CardTitle className="text-xl font-bold animate-fade-in">
              📊 Tournament Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ZeroStats />
          </CardContent>
        </div>

        {/* Rules Section */}
        <div className="bg-white shadow-lg rounded-lg p-4 lg:row-span-2 h-full animate-slide-in">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Crazy Uno Tournament Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col justify-between h-full">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold">Game Setup</h2>
                <ul className="list-disc list-inside text-gray-700">
                  <li>
                    <strong>Choosing the Dealer:</strong> First dealer is to the
                    right of the oldest player.
                  </li>
                  <li>
                    <strong>Card Distribution:</strong> Dealer picks a starting
                    hand size between 5-10 cards.
                  </li>
                </ul>
              </section>
              <section>
                <h2 className="text-xl font-semibold">Gameplay Rules</h2>
                <ul className="list-disc list-inside text-gray-700">
                  <li>
                    <strong>Out-of-Turn Play:</strong> Play immediately if you
                    have a card matching both color and number.
                  </li>
                  <li>
                    <strong>Stacking:</strong> +2 and +4 cards can be stacked to
                    pass penalties.
                  </li>
                  <li>
                    <strong>Draw Until You Can Play:</strong> Keep drawing until
                    you have a valid card.
                  </li>
                  <li>
                    <strong>Hand Rotation Rule:</strong> Playing a 0 forces all
                    players to rotate hands the direction of play.
                  </li>
                </ul>
              </section>
              <section>
                <h2 className="text-xl font-semibold">Winning the Game</h2>
                <p className="text-gray-700">
                  A player wins by playing all their cards. Scoring follows
                  standard UNO rules. Tournament is over when all players decide
                  to end.
                </p>
              </section>
            </div>
          </CardContent>
        </div>

        {/* Winner & Loser Cards - Directly Below Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full col-span-2">
          {/* Winner Card */}
          <div className="bg-white shadow-lg rounded-lg p-4 transition-all duration-500 ease-in-out hover:shadow-2xl transform hover:scale-105 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-left animate-pulse">
                🏆 Recent Tournament Winner 🏆
              </CardTitle>
            </CardHeader>
            <CardContent className="text-left">
              {recentWinner ? (
                <div>
                  <p className="text-3xl font-bold">{recentWinner.name}</p>
                  <p className="text-lg text-gray-600">
                    Winner of <strong>{recentWinner.title}</strong>
                  </p>
                  <p className="text-xl font-bold mt-2">
                    Final Score: {recentWinner.score} pts
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No completed tournaments yet!</p>
              )}
            </CardContent>
          </div>

          {/* Loser Card */}
          <div className="bg-white shadow-lg rounded-lg p-4 transition-all duration-500 ease-in-out hover:shadow-2xl transform hover:scale-105 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-left animate-pulse">
                ❌ Recent Tournament Loser ❌
              </CardTitle>
            </CardHeader>
            <CardContent className="text-left">
              {recentLoser ? (
                <div>
                  <p className="text-3xl font-bold">{recentLoser.name}</p>
                  <p className="text-lg text-gray-600">
                    Last place in <strong>{recentLoser.title}</strong>
                  </p>
                  <p className="text-xl font-bold mt-2">
                    Final Score: {recentLoser.score} pts
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No completed tournaments yet!</p>
              )}
            </CardContent>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlternateHomePage;
