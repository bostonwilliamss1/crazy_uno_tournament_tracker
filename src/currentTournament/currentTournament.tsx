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

function CurrentTournament() {
  const [rounds, setRounds] = useState<
    { scores: { [playerId: number]: number } }[]
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
    const newRound: { scores: Record<number, number> } = { scores: {} };

    players.forEach((player) => {
      newRound.scores[player.id] = 0;
    });

    setRounds([...rounds, newRound]);
  };

  const handleScoreChange = (
    roundIndex: number,
    playerId: number,
    value: number
  ) => {
    setRounds((prevRounds) => {
      const updatedRounds = [...prevRounds];

      if (!updatedRounds[roundIndex]) {
        updatedRounds[roundIndex] = { scores: {} };
      }

      updatedRounds[roundIndex].scores[playerId] = value;

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

  return (
    <div>
      <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight ml-3">
        Home Page
      </h2>
      {currentTournament && (
        <div>
          <div>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight ml-3 my-3">
              {capitalizeFirstLetter(currentTournament.title)}
            </h3>
          </div>
          <Button onClick={addRound}>Add Round</Button>
          <div className="w-full flex flex-col items-center">
            <Table className="w-[85%] max-w-5xl border border-gray-300 shadow-lg mx-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] text-center">Round</TableHead>
                  {players.map((player: Person) => (
                    <TableHead
                      key={player.id}
                      className="w-[100px] text-center"
                    >
                      {capitalizeFirstLetter(player.name)}
                    </TableHead>
                  ))}
                </TableRow>
                {rounds.map((round, roundIndex) => (
                  <TableRow key={roundIndex}>
                    <TableCell className="font-bold">
                      Round {roundIndex + 1}
                    </TableCell>
                    {players.map((player) => (
                      <TableCell key={player.id}>
                        <input
                          type="number"
                          value={round.scores[player.id] || ""}
                          onChange={(e) =>
                            handleScoreChange(
                              roundIndex,
                              player.id,
                              Number(e.target.value)
                            )
                          }
                          className="w-16 text-center border border-gray-300 rounded"
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      <button
                        onClick={() => removeRound(roundIndex)}
                        className="px-2 py-1 bg-red-500 text-white rounded"
                      >
                        Remove
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-bold">Totals:</TableCell>
                  {players.map((player) => (
                    <TableCell key={player.id} className="font-bold">
                      {rounds.reduce(
                        (total, round) =>
                          total + (round.scores[player.id] || 0),
                        0
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrentTournament;
