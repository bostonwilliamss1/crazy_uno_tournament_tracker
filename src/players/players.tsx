import { useEffect, useState } from 'react';
import axios from 'axios';
import { Person } from '../models/Person';
import "./players.css";

type Score = {
    player_id: number;
    total_score: number;
};

const Players = () => {
    const [players, setPlayers] = useState<Person[]>([]);
    const [scores, setScores] = useState<Score[]>([]);

    useEffect(() => {
        axios.get('http://localhost:5001/api/players')
            .then((response) => {
                setPlayers(response.data);
            })
            .catch((error) => {
                console.error('Error fetching players:', error);
            });
    }, [players]);

      useEffect(() => {
        axios.get('http://localhost:5001/api/scores')
            .then((response) => setScores(response.data))
            .catch((error) => console.error('Error fetching scores:', error));
        }, [scores]);

    return (
        <div className="player-body">
            <div className="titles">
            <h3>Players</h3>
            <h3>Scores</h3>
            </div>
            <div className="tournament-section">
            {players.map((player) => {
                const playerScore = scores.find((score) => score.player_id === player.id);
                return (
                    <div className="player-score-row" key={player.id}>
                        <span className="player-name">{player.name}</span>
                        <span className="player-score">{playerScore ? playerScore.total_score : 0}</span>
                    </div>
                );
                })}
            </div>
        </div>
    );
};

export default Players;