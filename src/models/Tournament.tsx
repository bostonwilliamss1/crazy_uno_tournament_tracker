import { Person } from "./Person";

export interface Tournament {
    tournamentId: number;
    title: string;
    year: number;
    players: Person[];
    completed: boolean;
    winner: Person | null;
    roundsPlayed: number;
}