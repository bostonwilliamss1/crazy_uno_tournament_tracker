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
import WinsChart from "@/charts/winsChart";
import AverageScoreChart from "@/charts/averageScoreChart";
import { useMemo } from "react";
import { Person } from "@/models/Person";

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
  const [aggregatedZerosMap, setAggregatedZerosMap] = useState<
    Map<number, number>
  >(new Map());
  const [players, setPlayers] = useState<Person[]>([]);

  useEffect(() => {
    setSelectedTournament("");
  }, [location.pathname]);

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/players")
      .then((response) => {
        setPlayers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching players:", error);
      });
  }, []);

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
  }, [tournament]);

  useEffect(() => {
    if (!tournamentsInformation) return;

    const aggregatedZeros = new Map<number, number>();

    tournamentsInformation.forEach((tournament) => {
      const rounds = [
        ...new Set(
          Object.values(tournament.people)
            .flatMap((player) => Object.keys(player.rounds))
            .map(Number)
        ),
      ].sort((a, b) => a - b);

      Object.values(tournament.people).forEach((player) => {
        let count = 0;
        rounds.forEach((round) => {
          if (player.rounds[round] === 0) {
            count++;
          }
        });
        const current = aggregatedZeros.get(player.id) || 0;
        aggregatedZeros.set(player.id, current + count);
      });
    });

    setAggregatedZerosMap(aggregatedZeros);
  }, [tournamentsInformation]);

  const averageScores = useMemo(() => {
    if (!tournamentsInformation || tournamentsInformation.length === 0)
      return new Map<number, number>();

    const averageScoresMap = new Map<number, number>();

    tournamentsInformation.forEach((tournament) => {
      const rounds = [
        ...new Set(
          Object.values(tournament.people)
            .flatMap((player) => Object.keys(player.rounds))
            .map(Number)
        ),
      ].sort((a, b) => a - b);

      Object.values(tournament.people).forEach((player) => {
        let totalScore = 0;
        let totalRounds = 0;

        rounds.forEach((round: number) => {
          if (player.rounds?.[round] !== undefined) {
            totalScore += player.rounds[round];
            totalRounds++;
          }
        });

        const prevTotal = averageScoresMap.get(player.id) || 0;
        const prevRounds = averageScoresMap.get(-player.id) || 0;
        averageScoresMap.set(player.id, prevTotal + totalScore);
        averageScoresMap.set(-player.id, prevRounds + totalRounds);
      });
    });

    const finalAverages = new Map<number, number>();
    averageScoresMap.forEach((totalScore, playerId) => {
      if (playerId > 0) {
        const totalRounds = averageScoresMap.get(-playerId) || 1;
        const averageScore = totalScore / totalRounds;
        const roundedAverage = Number(averageScore.toFixed(2));
        finalAverages.set(playerId, roundedAverage);
      }
    });
    return finalAverages;
  }, [tournamentsInformation]);

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
      <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight ml-3">
        Statistics
      </h2>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight my-4 ml-3">
        All Tournaments Stats:
      </h3>
      <div className="flex">
        <div className="chart-container w-[25%] ml-3 mb-3">
          <Card>
            <CardHeader>
              <CardTitle>Overall Wins</CardTitle>
            </CardHeader>
            <CardContent>
              <WinsChart scores={totals} />
            </CardContent>
          </Card>
        </div>
        <Card className="chart-container w-[25%] ml-3 mb-3">
          <CardHeader>
            <CardTitle>All Tournaments Zero Count</CardTitle>
          </CardHeader>
          <CardContent>
            {Array.from(aggregatedZerosMap.entries()).map(
              ([playerId, totalZeros]) => {
                const playerName =
                  tournamentsInformation?.find((t) => t.people[playerId])
                    ?.people[playerId].name || "Unknown";
                return (
                  <p className="m-1" key={playerId}>
                    {playerName}: {totalZeros}
                  </p>
                );
              }
            )}
          </CardContent>
        </Card>
        <Card className="chart-container w-[25%] ml-3 mb-3">
          <CardHeader>
            <CardTitle>Average Scores</CardTitle>
          </CardHeader>
          <CardContent>
            {Array.from(averageScores.entries()).map(([playerId, avgScore]) => (
              <div className="m-1" key={playerId}>
                {players.find((p) => p.id === playerId)?.name}: {avgScore} pts
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4 ml-3">
        {selectedTournament} Tournament Stats:
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
                <div key={count} className="flex">
                  <p className="font-bold m-1">
                    {count + 1}
                    {nthNumber(count + 1)}:
                  </p>
                  <p className="m-1">{player.player_name}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <div className="chart-container w-[50%]">
          <AverageScoreChart tournament={tournament} />
        </div>
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
        <div className="chart-container w-[50%]">
          <PlayerScoresChart scores={filteredTotals} />
        </div>
      </div>
    </div>
  );
}

export default Stats;
