import { Tournament } from "./models/Tournament";

const tournaments: Tournament[] = [];
const nextId = tournaments.length > 0 ? Math.max(...tournaments.map((tour) => tour.tournamentId)) + 1 : 0;
const year = Date.now();

function handleClick() {
    const newTournament: Tournament = {
        tournamentId: nextId,
        year: year,
        title: `Crazy Uno Tournament ${year}`,
        players: [],
        completed: false,
        winner: null,
        roundsPlayed: 0
    }
    tournaments.push(newTournament);
}

function StartTournament() {
    return (
        <button onClick={() => handleClick()}>Start Tournament</button>
    )
}

export default StartTournament;