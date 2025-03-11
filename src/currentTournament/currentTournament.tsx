import { Person } from "../models/Person";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { Tournament } from "@/models/Tournament";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";

function CurrentTournament() {
  const [rounds, setRounds] = useState<
    { scores: { [playerId: number]: number | undefined } }[]
  >([]);
  const [currentTournament, setCurrentTournament] = useState<Tournament>();
  const [players, setPlayers] = useState<Person[]>([]);

  function capitalizeFirstLetter(val: string) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }

  useEffect(() => {
    const savedTournaments = JSON.parse(
      localStorage.getItem("tournaments") || "[]"
    );
    if (savedTournaments.length > 0) {
      const latestTournament: Tournament =
        savedTournaments[savedTournaments.length - 1];
      setCurrentTournament(latestTournament);
      setPlayers(latestTournament.people || []);
    }

    const savedRounds = JSON.parse(localStorage.getItem("rounds") || "[]");
    if (savedRounds.length > 0) {
      setRounds(savedRounds);
    }
  }, []);

  useEffect(() => {
    if (rounds.length > 0) {
      localStorage.setItem("rounds", JSON.stringify(rounds));
    }
  }, [rounds]);

  useEffect(() => {
    const savedTournaments = JSON.parse(
      localStorage.getItem("tournaments") || "[]"
    );
    if (savedTournaments.length > 0) {
      const latestTournament: Tournament =
        savedTournaments[savedTournaments.length - 1];
      setCurrentTournament(latestTournament);
      setPlayers(latestTournament.people || []);
    }
  }, []);

  const addRound = () => {
    const newRound: { scores: Record<number, number | undefined> } = {
      scores: {},
    };

    players.forEach((player) => {
      newRound.scores[player.id] = undefined;
    });

    setRounds([...rounds, newRound]);
  };

  const handleScoreChange = (
    roundIndex: number,
    playerId: number,
    value: string
  ) => {
    setRounds((prevRounds) => {
      const updatedRounds = [...prevRounds];
      if (!updatedRounds[roundIndex]) {
        updatedRounds[roundIndex] = { scores: {} };
      }
      updatedRounds[roundIndex].scores[playerId] =
        value === "" ? undefined : Number(value);
      localStorage.setItem("rounds", JSON.stringify(updatedRounds));
      return updatedRounds;
    });
  };

  const removeRound = (roundIndex: number) => {
    setRounds((prevRounds) => {
      const updatedRounds = prevRounds.filter(
        (_, index) => index !== roundIndex
      );
      localStorage.setItem("rounds", JSON.stringify(updatedRounds));
      return updatedRounds;
    });
  };

  const onCompleteTournament = () => {
    if (!currentTournament) {
      alert("No active tournament found.");
      return;
    }

    const formattedTournament = {
      tournamentId: currentTournament?.tournamentId || 0,
      title: currentTournament?.title || "Untitled Tournament",
      year: currentTournament?.year || new Date().getFullYear(),
      completed: true,

      people: players.reduce<{
        [key: number]: {
          name: string;
          id: number;
          rounds: { [round: number]: number };
        };
      }>((acc, player) => {
        acc[player.id] = {
          name: player.name,
          id: player.id,

          rounds: rounds.reduce<{ [round: number]: number }>(
            (roundAcc, round, roundIndex) => {
              roundAcc[roundIndex + 1] = round.scores[player.id] ?? 0;
              return roundAcc;
            },
            {}
          ),
        };
        return acc;
      }, {}),
    };

    console.log("Formatted Tournament for Database:", formattedTournament);

    // axios
    //   .post("http://localhost:5001/api/tournaments", updatedTournament)
    //   .then((response) => {
    //     console.log(response.data.message);
    //     alert("Tournament saved successfully!");
    //   })
    //   .catch((error) => {
    //     console.error("Error saving tournament:", error);
    //     alert("Failed to save tournament");
    //   });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      {/* Page Title */}
      <h2 className="text-3xl font-semibold tracking-tight mb-6">Home Page</h2>

      {currentTournament && (
        <div className="bg-white shadow-lg rounded-lg p-6 w-[85%] max-w-5xl">
          {/* Tournament Title & Add Round Button */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold">
              {capitalizeFirstLetter(currentTournament.title)}
            </h3>
            <Button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              onClick={addRound}
            >
              + Add Round
            </Button>
          </div>

          {/* Scores Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 shadow-lg bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 p-3 text-center">
                    Round
                  </th>
                  {players.map((player: Person) => (
                    <th
                      key={player.id}
                      className="border border-gray-300 p-3 text-center"
                    >
                      {capitalizeFirstLetter(player.name)}
                    </th>
                  ))}
                  <th className="border border-gray-300 p-3 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {rounds.map((round, roundIndex) => (
                  <tr key={roundIndex} className="hover:bg-gray-100">
                    <td className="border border-gray-300 p-3 text-center font-semibold">
                      {roundIndex + 1}
                    </td>
                    {players.map((player) => (
                      <td
                        key={player.id}
                        className="border border-gray-300 p-3 text-center"
                      >
                        <Input
                          type="number"
                          id={`round-${roundIndex}-player-${player.id}`}
                          name={`round[${roundIndex}][${player.id}]`}
                          value={
                            round.scores[player.id] !== undefined
                              ? String(round.scores[player.id])
                              : ""
                          }
                          onChange={(e) =>
                            handleScoreChange(
                              roundIndex,
                              player.id,
                              e.target.value
                            )
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg text-center"
                        />
                      </td>
                    ))}
                    <td className="border border-gray-300 p-3 text-center">
                      <Button
                        onClick={() => removeRound(roundIndex)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
                {/* Totals Row */}
                <tr className="bg-gray-100 font-semibold">
                  <td className="border border-gray-300 p-3 text-center">
                    Totals:
                  </td>
                  {players.map((player) => (
                    <td
                      key={player.id}
                      className="border border-gray-300 p-3 text-center"
                    >
                      {rounds.reduce(
                        (total, round) =>
                          total + (round.scores[player.id] || 0),
                        0
                      )}
                    </td>
                  ))}
                  <td className="border border-gray-300 p-3 text-center"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Complete Tournament Button */}
          <div className="flex justify-center mt-6">
            <Button
              onClick={onCompleteTournament}
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
            >
              Complete Tournament
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrentTournament;
