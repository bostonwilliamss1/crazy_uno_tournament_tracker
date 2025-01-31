export interface Tournament {
  tournamentId: number;
  title: string;
  year: number;
  completed: boolean;
  winner: string | null;
}
