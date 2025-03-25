import { Person } from "./Person";

export interface Tournament {
  tournamentId: number;
  title: string;
  year: number;
  completed: boolean;
  winner: number;
  people: Person[];
  round_count: number;
}
