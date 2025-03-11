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
import { useMemo } from "react";
import { Person } from "@/models/Person";
import PlayerStats from "@/playerStats/PlayerStats";

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
  const [tournamentAverages, setTournamentAverages] = useState<
    Map<number, number>
  >(new Map());

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
    axios
      .get("http://localhost:5001/api/players")
      .then((response) => {
        setPlayers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching players:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/tournaments")
      .then((response) => {
        setOptions(
          response.data.map((tournament: Tournament) => ({
            title: tournament.title,
          }))
        );
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
      .get("http://localhost:5001/api/scores/totals")
      .then((response) => {
        setTotals(response.data);
      })
      .catch((error) => {
        console.error("Error fetching totals:", error);
      });
  }, []);

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
    if (tournament && totals) {
      const filtered = totals.filter((total) => {
        return total.tournament_id === tournament.tournamentId;
      });
      setFilteredTotals(filtered);
    }
  }, [selectedTournament, totals]);

  useEffect(() => {
    if (!tournamentsInformation) return;

    const aggregatedZeros = new Map<number, number>();

    tournamentsInformation.forEach((tournament) => {
      const rounds = [
        ...new Set(
          Object.values(tournament.people || {})
            .flatMap((player) => Object.keys(player.rounds || {}))
            .map(Number)
        ),
      ].sort((a, b) => a - b);

      Object.values(tournament.people || {}).forEach((player) => {
        let count = 0;
        rounds.forEach((round) => {
          if (player.rounds?.[round] === 0) {
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
    if (!tournament) return;

    const newAverages = new Map<number, number>();

    Object.values(tournament.people).forEach((player) => {
      const scores = Object.values(player.rounds).filter(
        (score) => score !== undefined
      );

      if (scores.length === 0) return;

      const totalScore = scores.reduce((a, b) => a + b, 0);
      const averageScore = totalScore / scores.length;

      newAverages.set(player.id, Number(averageScore.toFixed(2)));
    });

    setTournamentAverages(newAverages);
  }, [tournament]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <h2 className="text-3xl font-semibold tracking-tight ml-3">Statistics</h2>
      <h3 className="text-2xl font-semibold tracking-tight my-4 ml-3">
        All Tournaments Statistics:
      </h3>

      {/* Main Statistics Section */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
        {/* Wins Chart */}
        <div className="bg-white shadow-lg rounded-lg p-4">
          <CardHeader>
            <CardTitle>Overall Wins</CardTitle>
          </CardHeader>
          <CardContent>
            <WinsChart scores={totals} />
          </CardContent>
        </div>

        {/* All Tournaments Zero Count */}
        <div className="bg-white shadow-lg rounded-lg p-4">
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
                  <p className="text-gray-700 text-sm my-1" key={playerId}>
                    {playerName}:{" "}
                    <span className="font-semibold">{totalZeros}</span>
                  </p>
                );
              }
            )}
          </CardContent>
        </div>

        {/* Average Scores */}
        <div className="bg-white shadow-lg rounded-lg p-4">
          <CardHeader>
            <CardTitle>Average Scores</CardTitle>
          </CardHeader>
          <CardContent>
            {Array.from(averageScores.entries()).map(([playerId, avgScore]) => (
              <p className="text-gray-700 text-sm my-1" key={playerId}>
                {players.find((p) => p.id === playerId)?.name}:{" "}
                <span className="font-semibold">{avgScore} pts</span>
              </p>
            ))}
          </CardContent>
        </div>
      </div>

      {/* Tournament Selector */}
      <h3 className="text-2xl font-semibold tracking-tight mb-4 ml-3">
        {selectedTournament} Tournament Statistics:
      </h3>
      <div className="ml-3">
        <Select onValueChange={(value) => setSelectedTournament(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Tournament" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option, index) => (
              <SelectItem key={index} value={option.title}>
                {option.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tournament Statistics Grid */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6 mt-6">
        {/* Final Rankings */}
        <div className="bg-white shadow-lg rounded-lg p-4">
          <CardHeader>
            <CardTitle>Final Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedTournament ? (
              <p className="text-gray-600">
                Select a Tournament to See Statistics
              </p>
            ) : (
              sortedPlayers.map((player, count) => (
                <div key={count} className="flex text-gray-700 text-sm my-1">
                  <p className="font-bold mr-2">
                    {count + 1}
                    {nthNumber(count + 1)}:
                  </p>
                  <p>{player.player_name}</p>
                </div>
              ))
            )}
          </CardContent>
        </div>

        {/* Average Scores per Tournament */}
        <div className="bg-white shadow-lg rounded-lg p-4">
          <CardHeader>
            <CardTitle>Average Scores</CardTitle>
          </CardHeader>
          <CardContent>
            {Array.from(tournamentAverages.entries()).map(
              ([playerId, avgScore]) => {
                const player = players.find((p) => p.id === playerId);
                if (!player) {
                  console.warn(`No player found for ID: ${playerId}`);
                  return null;
                }
                return (
                  <p className="text-gray-700 text-sm my-1" key={playerId}>
                    {player.name}:{" "}
                    <span className="font-semibold">{avgScore} pts</span>
                  </p>
                );
              }
            )}
          </CardContent>
        </div>

        {/* Zero Count */}
        <div className="bg-white shadow-lg rounded-lg p-4">
          <CardHeader>
            <CardTitle>Zero Count</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedTournament || zerosMap.size === 0 ? (
              <p className="text-gray-600">
                Select a Tournament to See Statistics
              </p>
            ) : (
              Array.from(zerosMap.entries()).map(([playerId, zeroCount]) => {
                const playerName = tournament?.people[playerId]?.name;
                return (
                  <p className="text-gray-700 text-sm my-1" key={playerId}>
                    {playerName}:{" "}
                    <span className="font-semibold">{zeroCount}</span>
                  </p>
                );
              })
            )}
          </CardContent>
        </div>
      </div>

      {/* Player Scores Chart */}
      <div className="bg-white shadow-lg rounded-lg p-4 mt-6">
        <PlayerScoresChart scores={filteredTotals} />
      </div>

      {/* Player Statistics */}
      <h3 className="text-2xl font-semibold tracking-tight mt-6 ml-3">
        Player Statistics:
      </h3>
      <div className="bg-white shadow-lg rounded-lg p-4 mt-3">
        <PlayerStats />
      </div>
    </div>
  );
}

export default Stats;
