import axios from "axios";
import { Tournament } from "@/models/Tournament";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "react-router-dom";
import PlayerScoresChart from "@/charts/playerScoresChart";

type Option = {
  title: string;
};

type Totals = {
  player_name: string;
  player_id: number;
  tournament_id: number;
  total_score: number;
};

function Stats() {
  const [selectedTournament, setSelectedTournament] = useState("");
  const [tournamentsInformation, setTournamentsInformation] =
    useState<Tournament[]>();
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
  const [options, setOptions] = useState<Option[]>([]);
  const [zerosMap, setZerosMap] = useState<Map<number, number>>(new Map());
  const [filteredTotals, setFilteredTotals] = useState<Totals[]>([]);
  const [totals, setTotals] = useState<Totals[]>();
  const sortedPlayers = [
    ...filteredTotals.sort((a, b) => a.total_score - b.total_score),
  ];
  const location = useLocation();

  useEffect(() => {
    setSelectedTournament("");
  }, [location.pathname]);

  const nthNumber = (number: number) => {
    if (number > 3 && number < 21) return "th";
    switch (number % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

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
  }, [selectedTournament]);

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

  return (
    <div>
      <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight mb-3 ml-3">
        Statistics
      </h2>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight my-4 ml-3">
        Selected Tournament: {selectedTournament}
      </h3>
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
      <div className="flex">
        <Card className="m-3 w-[25%]">
          <CardHeader>
            <CardTitle>Final Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedTournament ? (
              <p>Select a Tournament to See Statistics</p>
            ) : (
              sortedPlayers.map((player, count) => (
                <div className="flex">
                  <p className="font-bold m-1">
                    {count + 1}
                    {nthNumber(count + 1)}:
                  </p>
                  <p className="m-1">
                    {player.player_name} ({player.total_score})
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card className="m-3 w-[25%]">
          <CardHeader>
            <CardTitle>Zero Count</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedTournament || zerosMap.size === 0 ? (
              <p>Select a Tournament to See Statistics</p>
            ) : (
              Array.from(zerosMap.entries()).map(([playerId, zeroCount]) => {
                const playerName = tournament?.people[playerId]?.name;
                return (
                  <p className="m-1" key={playerId}>
                    {playerName}: {zeroCount}
                  </p>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
      <div className="chart-container">
        <PlayerScoresChart scores={totals} />
      </div>
    </div>
  );
}

export default Stats;
