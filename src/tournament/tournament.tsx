import React, { useEffect, useRef, useState } from "react";
import { Tournament } from "../models/Tournament";
import "./tournament.css";
import { Person } from "../models/Person";
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
    { id: 1, name: "", rounds: {} },
    { id: 2, name: "", rounds: {} },
  ]);
  const titleRef = useRef<HTMLInputElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (players.length > 0) {
      titleRef.current?.focus();
    }
  }, []);

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
      id: players.length ? Math.max(...players.map((p) => p.id)) + 1 : 1,
      name: "",
      rounds: {},
    };
    setPlayers([...players, newPlayer]);

    setTimeout(() => {
      const lastIndex = players.length;
      inputRefs.current[lastIndex]?.focus();
    }, 0);
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
      people: players,
    };
    saveTournamentsToLocalStorage(newTournament);
    setTournaments([...tournaments, newTournament]);

    setPlayers([
      { id: 1, name: "", rounds: {} },
      { id: 2, name: "", rounds: {} },
    ]);
    setTitle("");
  };

  const handleDeletePlayer = (index: number) => {
    const updatedPlayers = players.filter((_, i) => i !== index);
    setPlayers(updatedPlayers);
  };

  return (
    <div className="flex justify-center p-5 gap-100">
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
                    ref={titleRef}
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label>Players</Label>
                  {players.map((player, index) => (
                    <div className="flex flex-row" key={index}>
                      <Input
                        type="text"
                        value={player.name}
                        placeholder={`Player ${index + 1}`}
                        ref={(el) => (inputRefs.current[index] = el!)}
                        onChange={(e) => updatePlayer(index, e.target.value)}
                      />
                      <FaRegTrashCan
                        className="m-3"
                        onClick={() => handleDeletePlayer(index)}
                      />
                    </div>
                  ))}
                </div>
                <Button type="button" onClick={handleAddPlayer}>
                  Add Player
                </Button>
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

export default StartTournament;
