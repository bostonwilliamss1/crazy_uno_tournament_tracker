import "./createTournament.css";
import React, { useEffect, useRef, useState } from "react";
import { Tournament } from "../models/Tournament";
import { Person } from "../models/Person";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { launchConfetti } from "@/utils/confetti";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function CreateTournament() {
  const [title, setTitle] = useState("");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [players, setPlayers] = useState<Person[]>([]);
  const titleRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [existingPlayers, setExistingPlayers] = useState<Person[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("default");
  const [playerName, setPlayerName] = useState<string>("");
  const [nextPlayerId, setNextPlayerId] = useState(0);
  const [nextTournamentId, setNextTournamentId] = useState(0);

  useEffect(() => {
    if (players.length > 0) {
      titleRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/tournaments")
      .then((response) => {
        setTournaments(response.data);
        const existingIds = response.data.map(
          (tournament: Tournament) => tournament.tournamentId
        );
        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
        setNextTournamentId(maxId + 1);
      })
      .catch((error) => {
        console.error("Error fetching tournaments:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/players")
      .then((response) => {
        setExistingPlayers(response.data);
        const existingIds = response.data.map((player: Person) => player.id);
        const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;

        setNextPlayerId(maxId + 1);
      })
      .catch((error) => {
        console.error("Error fetching players:", error);
      });
  }, []);

  const saveTournamentsToLocalStorage = (tournament: Tournament) => {
    const tournaments = JSON.parse(
      localStorage.getItem("tournaments") || "[]"
    ) as Tournament[];
    tournaments.push(tournament);
    localStorage.setItem("tournaments", JSON.stringify(tournaments));
  };

  const handleAddPlayer = (playerName: string) => {
    const selectedPlayerObj = existingPlayers.find(
      (p) => p.name === playerName
    );
    if (!selectedPlayerObj) return;

    if (!players.some((p) => p.name === selectedPlayerObj.name)) {
      const updatedExistingPlayers = existingPlayers.filter(
        (p) => p.name !== playerName
      );

      setPlayers([...players, selectedPlayerObj]);
      setExistingPlayers(updatedExistingPlayers);

      setTimeout(() => setSelectedPlayer("default"), 0);
    }
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleCreate = () => {
    if (players.length < 2) {
      alert("You need at least two players to create a tournament!");
      return;
    }

    const newTournament: Tournament = {
      tournamentId: nextTournamentId,
      title: title,
      year: new Date().getFullYear(),
      completed: false,
      winner: null,
      people: players,
      round_count: 0,
    };
    saveTournamentsToLocalStorage(newTournament);
    setTournaments([...tournaments, newTournament]);

    setPlayers([{ id: 1, name: "", rounds: {}, nickname: "" }]);
    setTitle("");
    launchConfetti();
    navigate("/");
  };

  const handleDeletePlayer = (
    index: number,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    const removedPlayer = players[index];
    const updatedPlayers = players.filter((_, i) => i !== index);
    setPlayers(updatedPlayers);
    setExistingPlayers((prevPlayers) => [...prevPlayers, removedPlayer]);
  };

  const createPlayer = (playerName: string) => {
    setPlayers((players) => [
      ...players,
      { id: nextPlayerId, name: playerName, rounds: {}, nickname: "" },
    ]);
    setPlayerName("");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      {/* Title */}
      <h2 className="text-3xl font-semibold tracking-tight mb-6">
        Create Tournament
      </h2>

      {/* Tournament Form Card */}
      <div className="bg-white shadow-lg rounded-lg p-4 w-[35%]">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Create Tournament
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            {/* Tournament Title */}
            <div>
              <Label className="text-gray-700 font-medium">
                Tournament Title
              </Label>
              <Input
                id="title"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
                value={title}
                onChange={handleTitleChange}
                placeholder="Crazy Uno Tournament 2025"
                ref={titleRef}
              />
            </div>

            {/* Returning Players Dropdown */}
            <div>
              <Label className="text-gray-700 font-medium">
                Returning Players
              </Label>
              <Select
                value={selectedPlayer || "default"}
                onValueChange={(value) => {
                  if (value !== "default") {
                    setSelectedPlayer(value);
                    handleAddPlayer(value);
                  }
                }}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Select a Player" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default" disabled>
                    Select a Player
                  </SelectItem>
                  {existingPlayers.map((player, index) => (
                    <SelectItem key={index} value={player.name}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Add New Player */}
            <div>
              <Label className="text-gray-700 font-medium">
                Add a New Player
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  name="name"
                  type="text"
                  className="flex-1 p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter Player Name"
                  onChange={(e) => setPlayerName(e.target.value)}
                  value={playerName}
                />
                <Button
                  type="button"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  onClick={() => createPlayer(playerName)}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Player List */}
            <div className="border-t border-gray-300 pt-4">
              <Label className="text-lg font-semibold text-gray-700">
                Player List
              </Label>
              <div className="mt-2 max-h-48 overflow-y-scroll scrollbar scrollbar-thumb-gray-500 scrollbar-track-gray-300 scrollbar-thin pr-1">
                {players.length === 0 ? (
                  <p className="text-sm text-gray-500">No players added yet.</p>
                ) : (
                  players.map((player, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b border-gray-300 py-2"
                    >
                      <p className="text-sm font-medium">{player.name}</p>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={(event) => handleDeletePlayer(index, event)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            type="button"
            className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
            onClick={handleCreate}
          >
            Start Tournament
          </Button>
        </CardFooter>
      </div>
    </div>
  );
}

export default CreateTournament;
