export interface Tournament {
    tournamentId: number;
    title: string;
    year: number;
    players: string[];
    completed: boolean;
    winner: string | null;
    roundsPlayed: number;
}