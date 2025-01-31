import React, { useRef, useState } from "react";
import { Tournament } from "../models/Tournament";
import "./tournament.css";
import { Person } from "../models/Person";
import Players from "../players/players";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaRegTrashCan } from "react-icons/fa6";

function StartTournament() {
  const [title, setTitle] = useState("");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const nextId =
    tournaments.length > 0
      ? Math.max(...tournaments.map((tour) => tour.tournamentId)) + 1
      : 5;
  const [players, setPlayers] = useState<Person[]>([
    { id: nextId, name: "" },
    { id: nextId, name: "" },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  const saveTournamentsToLocalStorage = (tournament: Tournament) => {
    const tournaments = JSON.parse(
      localStorage.getItem("tournaments") || "[]"
    ) as Tournament[];
    tournaments.push(tournament);
    localStorage.setItem("tournaments", JSON.stringify(tournaments));
  };

  // const getTournamentsFromLocalStorage = (): Tournament => {
  //     return JSON.parse(localStorage.getItem("tournaments") || "[]");
  // }

  // const removeTournamentsFromLocalStorage = (id: number) => {
  //     const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]') as Tournament[];
  //     const updatedTournaments = tournaments.filter(t => t.tournamentId !== id);
  //     localStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
  // }

  const handleAddPlayer = () => {
    const newPlayer: Person = {
      id: players.length + 1,
      name: "",
    };
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setPlayers([...players, newPlayer]);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const updatePlayer = (index: number, value: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].name = value;
    setPlayers(updatedPlayers);
  };

  const handleCreate = () => {
    if (players.length < 2) {
      alert("You need at least two players to create a tournament!");
      return;
    }

    const hasBlankInputs =
      players.some((player) => player.name.trim() === "") ||
      title.trim() === "";
    if (hasBlankInputs) {
      alert("Input boxes cannot be blank");
      return;
    }

    const newTournament: Tournament = {
      tournamentId: nextId,
      title: title,
      year: new Date().getFullYear(),
      completed: false,
      winner: null,
    };
    saveTournamentsToLocalStorage(newTournament);
    setTournaments([...tournaments, newTournament]);

    setPlayers([
      { id: nextId, name: "" },
      { id: nextId, name: "" },
    ]);
    setTitle("");
  };

  const handleDeletePlayer = (index: number) => {
    const updatedPlayers = players.filter((_, i) => i !== index);
    setPlayers(updatedPlayers);
  };

  return (
    <div className="flex justify-between p-10">
      <div className="tournament-body">
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
                    id="name"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Crazy Uno Tournament 2025"
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label>Players</Label>
                  {players.map((player, index) => (
                    <div key={index}>
                      <Input
                        type="text"
                        value={player.name}
                        ref={inputRef}
                        placeholder={`Player ${index + 1}`}
                        onChange={(e) => updatePlayer(index, e.target.value)}
                        required
                      />
                      <FaRegTrashCan onClick={() => handleDeletePlayer} />
                    </div>
                  ))}
                </div>
                <Button onClick={handleAddPlayer}>Add Player</Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handleCreate}>Submit</Button>
          </CardFooter>
        </Card>
      </div>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Most Recent Tournament</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-1.5">
            <Players />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StartTournament;
