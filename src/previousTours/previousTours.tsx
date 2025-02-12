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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Option = {
  title: string;
};

type Totals = {
  player_name: string;
  player_id: number;
  tournament_id: number;
  total_score: number;
};

function PreviousTours() {
  const [selectedTournament, setSelectedTournament] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [tournamentsInformation, setTournamentsInformation] =
    useState<Tournament[]>();
  const [totals, setTotals] = useState<Totals[]>();
  const [filteredTotals, setFilteredTotals] = useState<Totals[]>([]);
  const tournament = tournamentsInformation?.find(
    (t) => t.title === selectedTournament
  );
  const allRounds = tournament
    ? [
        ...new Set(
          Object.values(tournament.people)
            .flatMap((player) => Object.keys(player.rounds))
            .map(Number)
        ),
      ].sort((a, b) => a - b)
    : [];
  const [zerosMap, setZerosMap] = useState<Map<number, number>>(new Map());

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/tournaments-titles")
      .then((response) => {
        setOptions(response.data);
      })
      .catch((error) => {
        console.error("Error fetching tournament titles:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/tournament-players")
      .then((response) => {
        setTournamentsInformation(response.data);
      })
      .catch((error) => {
        console.error("Error fetching tournament players:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/totals")
      .then((response) => {
        setTotals(response.data);
      })
      .catch((error) => {
        console.error("Error fetching totals:", error);
      });
  }, []);

  useEffect(() => {
    if (tournament && totals) {
      const filtered = totals.filter((total) => {
        return total.tournament_id === tournament.tournamentId;
      });
      setFilteredTotals(filtered);
    }
  }, [selectedTournament, totals]);

  useEffect(() => {
    if (!tournament) return;

    const newZerosMap = new Map<number, number>();

    Object.values(tournament.people).forEach((player) => {
      let count = 0;
      allRounds.forEach((round) => {
        if (player.rounds[round] === 0) {
          count += 1;
        }
      });
      newZerosMap.set(player.id, count);
    });

    setZerosMap(newZerosMap);
  }, [selectedTournament, tournament, allRounds]);

  return (
    <div>
      <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight mb-3 ml-3">
        Previous Tournaments
      </h2>
      <Select onValueChange={(value) => setSelectedTournament(value)}>
        <SelectTrigger className="w-[180px] ml-3">
          <SelectValue placeholder="Select Tournament" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option, index) => (
            <SelectItem className="ml-3" key={index} value={option.title}>
              {option.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight my-4 ml-3">
        Selected Tournament: {selectedTournament}
      </h3>
      {/* Tournament Table */}
      {tournament && (
        <div className="w-full flex flex-col items-center">
          <Table className="w-[85%] max-w-5xl border border-gray-300 shadow-lg mx-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-center">Round</TableHead>
                {Object.values(tournament.people).map((player) => (
                  <TableHead key={player.id} className="w-[100px] text-center">
                    {player.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allRounds.map((round) => (
                <TableRow key={round}>
                  <TableCell className="text-center">{round}</TableCell>
                  {Object.values(tournament.people).map((player) => (
                    <TableCell key={player.id} className="text-center">
                      {player.rounds[round] === 0 ? (
                        <div className="bg-yellow-200">
                          {player.rounds[round]}
                        </div>
                      ) : (
                        <div>{player.rounds[round]}</div>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="font-bold">Totals:</TableCell>
                {Object.values(tournament.people).map((player) => {
                  const playerTotal = filteredTotals.find(
                    (total) => total.player_id === player.id
                  );
                  return (
                    <TableCell
                      key={player.id}
                      className="text-center font-bold"
                    >
                      {playerTotal ? playerTotal.total_score : 0}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default PreviousTours;
