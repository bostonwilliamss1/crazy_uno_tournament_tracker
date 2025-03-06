import { Person } from "./Person";

export interface Tournament {
  tournamentId: number;
  title: string;
  year: number;
  completed: boolean;
  winner: string | null;
  people: Person[];
  round_count: number;
}
