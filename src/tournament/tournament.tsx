import React, { useState } from 'react';
import { Tournament } from '../models/Tournament';
import "./tournament.css";

function StartTournament() {
    const [title, setTitle] = useState('');
    const [players, setPlayers] = useState<string[]>(["", ""]);
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const nextId = tournaments.length > 0 ? Math.max(...tournaments.map((tour) => tour.tournamentId)) + 1 : 1;

    const handleAddPlayer = () => {
        setPlayers([...players, ""]);
    };

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    };

    const updatePlayer = (index: number, value: string) => {
        const updatedPlayers = [...players];
        updatedPlayers[index] = value;
        setPlayers(updatedPlayers);
    };

    const handleCreate = () => {
        if (players.length < 2) {
            alert("You need at least two players to create a tournament!");
            return;
        }

        const hasBlankInputs = players.some((player) => player.trim() === "") || title.trim() === "";
        if (hasBlankInputs) {
            alert("Input boxes cannot be blank");
        return;
        }

        const newTournament: Tournament = {
            tournamentId: nextId,
            title: title,
            year: new Date().getFullYear(),
            players: players,
            completed: false,
            winner: null,
            roundsPlayed: 0,
        }
        
        setTournaments([...tournaments, newTournament]);
        console.log("tournaments", tournaments);
        setPlayers(["", ""]);
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
                                value={player}
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
            <h2 className="title">Most Recent Tournament Created</h2>
            {tournaments.map((tournament, index) => (
                <div key={index} className="tournament">
                    <h3>Title:</h3>
                    <p>{tournament.title}</p>
                    <h4>Players: </h4>
                    <ul className='player-list'>
                    {tournament.players.map((player, index) => (
                        <li className="player" key={index}>{player}</li>
                    ))}
                    </ul>
                </div>
            ))}
        </div>
        </div>
    )}

export default StartTournament;
