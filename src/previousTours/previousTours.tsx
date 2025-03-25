import axios from "axios";
import { useEffect, useState } from "react";
import { Tournament } from "../models/Tournament";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MyDocument from "@/pdfexport/pdfexport";

type Totals = {
  player_name: string;
  player_id: number;
  tournament_id: number;
  total_score: number;
};

function PreviousTours() {
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);
  const [tournamentsInformation, setTournamentsInformation] = useState<
    Tournament[]
  >([]);
  const [totals, setTotals] = useState<Totals[]>([]);
  const [filteredTotals, setFilteredTotals] = useState<Totals[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/tournament-players/")
      .then((response) => {
        setTournamentsInformation(response.data);
      })
      .catch((error) => {
        console.error("Error fetching player information:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/scores/totals")
      .then((response) => {
        setTotals(response.data);
      })
      .catch((error) => {
        console.error("Error fetching totals:", error);
      });
  }, []);

  useEffect(() => {
    if (selectedTournament?.tournamentId && totals.length > 0) {
      setFilteredTotals(
        totals.filter(
          (total) => total.tournament_id === selectedTournament.tournamentId
        )
      );
    }
  }, [selectedTournament, totals]);

  const tournament = tournamentsInformation.find(
    (t) => t.tournamentId === selectedTournament?.tournamentId
  );

  const allRounds = tournament?.people
    ? [
        ...new Set(
          Object.values(tournament.people)
            .flatMap((player: any) =>
              player.rounds ? Object.keys(player.rounds) : []
            )
            .map(Number)
        ),
      ].sort((a, b) => a - b)
    : [];

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      {/* Title */}
      <h2 className="text-3xl font-semibold tracking-tight mb-6">
        Previous Tournaments
      </h2>

      {/* Tournament Selector */}
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg w-full">
        <h3 className="text-xl font-semibold mb-4">Select a Tournament</h3>
        <Select
          onValueChange={(value) => {
            const selectedTournamentData = tournamentsInformation.find(
              (opt) => opt.title === value
            );
            setSelectedTournament(selectedTournamentData || null);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Tournament" />
          </SelectTrigger>
          <SelectContent>
            {tournamentsInformation.map((tournament: Tournament, i) => (
              <SelectItem key={i} value={tournament.title}>
                {tournament.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Tournament Display */}
      <h3 className="text-2xl font-semibold tracking-tight my-3">
        {selectedTournament
          ? `Tournament: ${selectedTournament.title}`
          : "No Tournament Selected"}
      </h3>

      {selectedTournament && (
        <div className="w-full flex flex-col items-center">
          {selectedTournament && (
            <div className="">
              <MyDocument tournament={selectedTournament} />
            </div>
          )}
          <div className="bg-white shadow-lg rounded-lg p-6 w-[85%] max-w-5xl">
            <h3 className="text-xl font-semibold mb-4">Tournament Scores</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 shadow-lg bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 p-3 text-center">
                      Round
                    </th>
                    {Object.values(selectedTournament.people).map(
                      (player: any) => (
                        <th
                          key={player.id}
                          className="border border-gray-300 p-3 text-center"
                        >
                          {player.name}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {allRounds.map((round) => (
                    <tr key={round} className="hover:bg-gray-100">
                      <td className="border border-gray-300 p-3 text-center font-semibold">
                        {round}
                      </td>
                      {Object.values(selectedTournament.people).map(
                        (player: any) => (
                          <td
                            key={player.id}
                            className="border border-gray-300 p-3 text-center"
                          >
                            {player.rounds &&
                            player.rounds[round] !== undefined ? (
                              player.rounds[round] === 0 ? (
                                <div className="bg-yellow-200 p-1 rounded">
                                  {player.rounds[round]}
                                </div>
                              ) : (
                                <div>{player.rounds[round]}</div>
                              )
                            ) : (
                              "-"
                            )}
                          </td>
                        )
                      )}
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-semibold">
                    <td className="border border-gray-300 p-3 text-center">
                      Totals:
                    </td>
                    {Object.values(selectedTournament.people).map(
                      (player: any) => {
                        const playerTotal = filteredTotals.find(
                          (total) => total.player_id === player.id
                        );
                        return (
                          <td
                            key={player.id}
                            className="border border-gray-300 p-3 text-center font-bold"
                          >
                            {playerTotal ? playerTotal.total_score : 0}
                          </td>
                        );
                      }
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PreviousTours;
