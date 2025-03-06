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
  console.log("currentTournament", currentTournament);
  const onCompleteTournament = () => {
    axios
      .post("http://localhost:5001/api/tournaments", currentTournament)
      .then((response) => {
        console.log(response.data.message);
        alert("Tournament created successfully!");
      })
      .catch((error) => {
        console.error("Error creating tournament:", error);
        alert("Failed to create tournament");
      });
  };

  return (
    <div>
      <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight ml-3">
        Home Page
      </h2>
      {currentTournament && (
        <div>
          <div className="w-[85%] max-w-5xl mx-auto flex justify-between items-center px-2 py-3">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              {capitalizeFirstLetter(currentTournament.title)}
            </h3>
            <Button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={addRound}
            >
              Add Round
            </Button>
          </div>
          <div className="w-[85%] max-w-5xl mx-auto flex flex-col items-center">
            <Table className="w-full border border-gray-300 shadow-lg mx-auto table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Round</TableHead>
                  {players.map((player: Person) => (
                    <TableHead key={player.id} className="text-center">
                      {capitalizeFirstLetter(player.name)}
                    </TableHead>
                  ))}
                  <TableHead className="text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rounds.map((round, roundIndex) => (
                  <TableRow key={roundIndex}>
                    <TableCell className="font-bold text-center">
                      {roundIndex + 1}
                    </TableCell>
                    {players.map((player) => (
                      <TableCell key={player.id} className="text-center">
                        <Input
                          type="number"
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
                          className="w-full text-center border border-gray-300 rounded"
                        />
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      <Button
                        onClick={() => removeRound(roundIndex)}
                        className="px-2 py-1 bg-red-500 text-white rounded"
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell className="font-bold">Totals:</TableCell>
                  {players.map((player) => (
                    <TableCell
                      key={player.id}
                      className="font-bold text-center"
                    >
                      {rounds.reduce(
                        (total, round) =>
                          total + (round.scores[player.id] || 0),
                        0
                      )}
                    </TableCell>
                  ))}
                  <TableCell>{/* Empty cell for alignment */}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="w-[85%] max-w-5xl mx-auto flex justify-between items-center py-3">
            <Button className="px-4 py-2 bg-blue-500 text-white rounded">
              Complete Tournament
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrentTournament;
