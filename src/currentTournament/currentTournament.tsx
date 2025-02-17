import { useLocation } from "react-router-dom";
import { Person } from "../models/Person";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useState } from "react";

function CurrentTournament() {
  const location = useLocation();
  const { title, players } = location.state || { title: "", players: [] };
  const [rounds, setRounds] = useState<
    { scores: { [playerId: number]: number } }[]
  >([]);

  function capitalizeFirstLetter(val: string) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }

  const addRound = () => {
    const newRound: { scores: Record<number, number> } = { scores: {} };
    players.forEach((player: Person) => (newRound.scores[player.id] = 0));
    setRounds([...rounds, newRound]);
  };

  console.log("title, players", title, players);
  return (
    <div>
      <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight ml-3">
        Home Page
      </h2>
      {title && players && (
        <div>
          <div>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight ml-3 my-3">
              {capitalizeFirstLetter(title)}
            </h3>
          </div>
          <div className="w-full flex flex-col items-center">
            <Table className="w-[85%] max-w-5xl border border-gray-300 shadow-lg mx-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] text-center">Round</TableHead>
                  {players.map((player: Person) => (
                    <TableHead
                      key={player.id}
                      className="w-[100px] text-center"
                    >
                      {capitalizeFirstLetter(player.name)}
                    </TableHead>
                  ))}
                </TableRow>
                <TableRow>
                  {/* <Input
                      type="number"
                      className="w-16 text-center border border-gray-400 rounded"
                      value={round.scores[player.id]}
                      onChange={(e) => updateScore(roundIndex, player.id, e.target.value)}
                    /> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-bold">Totals:</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrentTournament;
