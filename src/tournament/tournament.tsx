import React, { useRef, useState } from 'react';
import { Tournament } from '../models/Tournament';
import "./tournament.css";
import { Person } from '../models/Person';
import Players from '../players/players';

function StartTournament() {
    const [title, setTitle] = useState('');
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const nextId = tournaments.length > 0 ? Math.max(...tournaments.map((tour) => tour.tournamentId)) + 1 : 5;
    const [players, setPlayers] = useState<Person[]>([
        { id: nextId, name: ""},
        { id: nextId, name: ""},
    ]);
    const inputRef = useRef<HTMLInputElement>(null);

    const saveTournamentsToLocalStorage = (tournament: Tournament) => {
        const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]') as Tournament[];
        tournaments.push(tournament);
        localStorage.setItem('tournaments', JSON.stringify(tournaments));
    }

    const getTournamentsFromLocalStorage = (): Tournament => {
        return JSON.parse(localStorage.getItem("tournaments") || "[]");
    }

    const removeTournamentsFromLocalStorage = (id: number) => {
        const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]') as Tournament[];
        const updatedTournaments = tournaments.filter(t => t.tournamentId !== id);
        localStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
    }

    const handleAddPlayer = () => {
        const newPlayer: Person = {
            id: players.length + 1,
            name: ""
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

        const hasBlankInputs = players.some((player) => player.name.trim() === "") || title.trim() === "";
        if (hasBlankInputs) {
            alert("Input boxes cannot be blank");
            return;
        }

        const newTournament: Tournament = {
            tournamentId: nextId,
            title: title,
            year: new Date().getFullYear(),
            completed: false,
            winner: null
        }
        saveTournamentsToLocalStorage(newTournament);
        setTournaments([...tournaments, newTournament]);
        
        setPlayers([
            { id: nextId, name: ""},
            { id: nextId, name: ""},
        ]);
        setTitle("");
    };

    const handleDeletePlayer = (index: number) => {
        const updatedPlayers = players.filter((_, i) => i !== index);
        setPlayers(updatedPlayers);
    };

    return (
        <div className="whole-thing">
        <div className="tournament-body">
            <h1>Create Tournament</h1>
            <div className="tournament-form">
                <div className="form-item">
                <h3 className="form-title">Title</h3>
                <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder='Crazy Uno Tournament 2025'
                    required
                />
                </div>
                
                <div className="form-item">
                    <h3 className="form-title">Players</h3>
                    {players.map((player, index) => (
                        <div className="form-item-new-player" key={index}>
                            <input
                                type="text"
                                value={player.name}
                                ref={inputRef}
                                placeholder={`Player ${index + 1}`}
                                onChange={(e) => updatePlayer(index, e.target.value)}
                                required
                            />
                            <button onClick={() => handleDeletePlayer(index)}>Delete Player</button>
                        </div>
                    ))}
                    <button onClick={handleAddPlayer}>Add Player</button>
                </div>
            </div>
            <button className="submit-button" onClick={handleCreate}>Submit</button>
        </div>
        <div className="tournament-created">
            <h2 className="bg-blue-500">Most Recent Tournament</h2>
            <Players />
        </div>
        </div>
    )}

export default StartTournament;
