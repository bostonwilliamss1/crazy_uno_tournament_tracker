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
    <div>
      <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight mb-3 ml-3">
        Previous Tournaments
      </h2>
      <Select
        onValueChange={(value) => {
          const selectedTournamentData = tournamentsInformation.find(
            (opt) => opt.title === value
          );
          setSelectedTournament(selectedTournamentData || null);
        }}
      >
        <SelectTrigger className="w-[180px] ml-3">
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
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight my-4 ml-3">
        Selected Tournament: {selectedTournament?.title || "None"}
      </h3>
      {tournament && (
        <div className="w-full flex flex-col items-center">
          <Table className="w-[85%] max-w-5xl border border-gray-300 shadow-lg mx-auto">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px] text-center">Round</TableHead>
                {Object.values(tournament.people).map((player: any) => (
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
                  {Object.values(tournament.people).map((player: any) => (
                    <TableCell key={player.id} className="text-center">
                      {player.rounds && player.rounds[round] !== undefined ? (
                        player.rounds[round] === 0 ? (
                          <div className="bg-yellow-200">
                            {player.rounds[round]}
                          </div>
                        ) : (
                          <div>{player.rounds[round]}</div>
                        )
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="font-bold">Totals:</TableCell>
                {Object.values(tournament.people).map((player: any) => {
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
