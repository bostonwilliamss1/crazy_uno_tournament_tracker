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
  Card,
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
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    if (players.length > 0) {
      titleRef.current?.focus();
    }
    setNextId(
      existingPlayers.length > 0
        ? Math.max(...existingPlayers.map((player) => player.id)) + 1
        : 0
    );
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/players")
      .then((response) => {
        setExistingPlayers(response.data);
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
      tournamentId: nextId,
      title: title,
      year: new Date().getFullYear(),
      completed: false,
      winner: null,
      people: players,
    };
    saveTournamentsToLocalStorage(newTournament);
    setTournaments([...tournaments, newTournament]);

    setPlayers([{ id: 1, name: "", rounds: {} }]);
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
      { id: nextId, name: playerName, rounds: {} },
    ]);
    setPlayerName("");
  };

  return (
    <div className="flex pl-3 gap-5">
      <div className="tournament-body">
        <h2 className="scroll-m-20 pb-5 text-3xl font-semibold tracking-tight">
          Create Tournament
        </h2>
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Create Tournament</CardTitle>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label>Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Crazy Uno Tournament 2025"
                    ref={titleRef}
                  />
                </div>
                <div className="flex flex-col">
                  <Label>Returning Players</Label>
                  <Select
                    value={selectedPlayer || "default"}
                    onValueChange={(value) => {
                      if (value !== "default") {
                        setSelectedPlayer(value);
                        handleAddPlayer(value);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px] mt-2">
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
                <div className="flex flex-col space-y-1.5">
                  <Label>Add a New Player</Label>
                  <div className="flex flex-row">
                    <Input
                      name="name"
                      type="text"
                      placeholder="Create Player"
                      onChange={(e) => setPlayerName(e.target.value)}
                      value={playerName}
                    />
                    <Button
                      type="button"
                      className="ml-2"
                      onClick={() => createPlayer(playerName)}
                    >
                      Add Player
                    </Button>
                  </div>
                </div>
              </div>
              {/* Player List */}
              <div className="flex flex-col my-3">
                <Label className="my-1 text-lg">Player List</Label>
                {players.map((player, index) => (
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
                ))}
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" onClick={handleCreate}>
              Submit
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default CreateTournament;
