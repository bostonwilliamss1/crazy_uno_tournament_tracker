import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tournament } from "@/models/Tournament";
import axios from "axios";
import { useEffect, useState } from "react";

const ZeroStats = () => {
  const [aggregatedZerosMap, setAggregatedZerosMap] = useState<
    Map<number, number>
  >(new Map());
  const [tournamentsInformation, setTournamentsInformation] =
    useState<Tournament[]>();

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
      <CardHeader>
        <CardTitle>All Tournaments Zero Count</CardTitle>
      </CardHeader>
      <CardContent>
        {Array.from(aggregatedZerosMap.entries()).map(
          ([playerId, totalZeros]) => {
            const playerName =
              tournamentsInformation?.find((t) => t.people[playerId])?.people[
                playerId
              ].name || "Unknown";
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
  );
};

export default ZeroStats;
