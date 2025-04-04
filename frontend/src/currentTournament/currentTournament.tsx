import { Person } from "../models/Person";
import { useEffect, useState } from "react";
import { Tournament } from "@/models/Tournament";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { MdEdit } from "react-icons/md";
import { FaMinus } from "react-icons/fa";
import "./currentTournament.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AlternateHomePage from "@/alternateHomePage/alternateHomePage";
import { useNavigate } from "react-router-dom";

function CurrentTournament() {
  const [rounds, setRounds] = useState<
    { scores: { [playerId: number]: number | undefined } }[]
  >([]);
  const [currentTournament, setCurrentTournament] = useState<Tournament>();
  const [players, setPlayers] = useState<Person[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [existingPlayers, setExistingPlayers] = useState<Person[]>([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tournamentTitle, setTournamentTitle] = useState(
    capitalizeFirstLetter(currentTournament?.title || "Untitled Tournament")
  );
  const [tempPlayerName, setTempPlayerName] = useState("");
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [sortOrder, setSortOrder] = useState("original");
  const navigate = useNavigate();

  function capitalizeFirstLetter(val: string) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  }

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/players")
      .then((response) => {
        setExistingPlayers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching players:", error);
      });
  }, []);

  useEffect(() => {
    const savedTournaments = JSON.parse(
      localStorage.getItem("tournaments") || "[]"
    );
    if (savedTournaments.length > 0) {
      const latestTournament: Tournament =
        savedTournaments[savedTournaments.length - 1];

      const savedNicknames = JSON.parse(
        localStorage.getItem("playerNicknames") || "{}"
      );

      const updatedPlayers = latestTournament.people.map((player) => ({
        ...player,
        nickname: savedNicknames[player.id] || "",
      }));

      setCurrentTournament(latestTournament);
      setPlayers(updatedPlayers);
    }

    const savedRounds = JSON.parse(localStorage.getItem("rounds") || "[]");
    if (savedRounds.length > 0) {
      setRounds(savedRounds);
    }
  }, []);

  useEffect(() => {
    if (rounds.length > 0) {
      localStorage.setItem("rounds", JSON.stringify(rounds));
    }
  }, [rounds]);

  useEffect(() => {
    const savedPlayers = JSON.parse(localStorage.getItem("players") || "[]");
    if (savedPlayers.length > 0) {
      setPlayers(savedPlayers);
    }
  }, []);

  useEffect(() => {
    const savedTitle = localStorage.getItem("tournamentTitle");
    if (savedTitle) {
      setTournamentTitle(savedTitle);
    } else if (currentTournament?.title) {
      setTournamentTitle(capitalizeFirstLetter(currentTournament.title));
    }
  }, [currentTournament]);

  const addRound = () => {
    const newRound: { scores: Record<number, number | undefined> } = {
      scores: {},
    };

    players.forEach((player) => {
      newRound.scores[player.id] = undefined;
    });

    setRounds([...rounds, newRound]);
  };

  const sortedPlayers = [...players].sort((a, b) => {
    if (sortOrder === "firstToLast") {
      return (
        rounds.reduce((total, round) => total + (round.scores[a.id] || 0), 0) -
        rounds.reduce((total, round) => total + (round.scores[b.id] || 0), 0)
      );
    }
    if (sortOrder === "byId") {
      return a.id - b.id;
    }
    return 0;
  });

  const handlePlayerNameChange = (playerId: number, newName: string) => {
    const updatedPlayers = players.map((player) =>
      player.id === playerId ? { ...player, name: newName } : player
    );

    setPlayers(updatedPlayers);

    const trimmedName = newName.trim();
    if (trimmedName === "") return;

    const existingPlayer = existingPlayers.find(
      (p) => p.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    const finalPlayers = players.map((player) =>
      player.id === playerId
        ? existingPlayer || { ...player, name: trimmedName }
        : player
    );

    setPlayers(finalPlayers);
    localStorage.setItem("players", JSON.stringify(finalPlayers));

    if (!existingPlayer) {
      const newExistingPlayers = [
        ...existingPlayers,
        { id: playerId, name: trimmedName, nickname: "", rounds: {} },
      ];
      setExistingPlayers(newExistingPlayers);
      localStorage.setItem(
        "existingPlayers",
        JSON.stringify(newExistingPlayers)
      );
    }
  };

  const handleAddNewPlayer = () => {
    setAddingPlayer(true);
  };

  const handleSaveNewPlayer = () => {
    if (!tempPlayerName.trim()) return;

    const trimmedName = tempPlayerName.trim().toLowerCase();
    const isDuplicate = players.some(
      (p) => p.name.trim().toLowerCase() === trimmedName
    );

    if (isDuplicate) {
      alert("This player is already added to the tournament.");
      setTempPlayerName("");
      setAddingPlayer(false);
      return;
    }

    const existingPlayer = existingPlayers.find(
      (p) => p.name.trim().toLowerCase() === trimmedName
    );

    let updatedPlayers;
    if (existingPlayer) {
      updatedPlayers = [...players, existingPlayer];
    } else {
      const newPlayer: Person = {
        id: players.length > 0 ? Math.max(...players.map((p) => p.id)) + 1 : 1,
        name: tempPlayerName.trim(),
        nickname: "",
        rounds: {},
      };

      updatedPlayers = [...players, newPlayer];
      setExistingPlayers([...existingPlayers, newPlayer]);
      localStorage.setItem(
        "existingPlayers",
        JSON.stringify([...existingPlayers, newPlayer])
      );
    }

    setPlayers(updatedPlayers);
    localStorage.setItem("players", JSON.stringify(updatedPlayers));

    setTempPlayerName("");
    setAddingPlayer(false);
  };

  const handleRemovePlayer = (id: number) => {
    const updatedPlayers = players.filter((player) => player.id !== id);
    setPlayers(updatedPlayers);
    localStorage.setItem("players", JSON.stringify(updatedPlayers));
  };

  const handleScoreChange = (
    roundIndex: number,
    playerId: number,
    value: string
  ) => {
    setRounds((prevRounds) => {
      const updatedRounds = [...prevRounds];
      if (!updatedRounds[roundIndex]) {
        updatedRounds[roundIndex] = { scores: {} };
      }
      updatedRounds[roundIndex].scores[playerId] =
        value === "" ? undefined : Number(value);
      localStorage.setItem("rounds", JSON.stringify(updatedRounds));
      return updatedRounds;
    });
  };

  const removeRound = (roundIndex: number) => {
    setRounds((prevRounds) => {
      const updatedRounds = prevRounds.filter(
        (_, index) => index !== roundIndex
      );
      localStorage.setItem("rounds", JSON.stringify(updatedRounds));
      return updatedRounds;
    });
  };

  const onCompleteTournament = () => {
    if (!currentTournament) return;

    const tournamentId = currentTournament.tournamentId;

    const totalScores = players.map((player) => {
      const total = rounds.reduce(
        (sum, round) => sum + (round.scores[player.id] || 0),
        0
      );
      return {
        player_id: player.id,
        player_name: player.name,
        tournament_id: tournamentId,
        total_score: total,
      };
    });

    const winnerEntry = totalScores.reduce((min, curr) =>
      curr.total_score < min.total_score ? curr : min
    );

    const topPlayers = [...totalScores]
      .sort((a, b) => a.total_score - b.total_score)
      .slice(0, 3);

    const tournament = {
      tournament_id: tournamentId,
      title: currentTournament.title,
      year: currentTournament.year,
      winner_id: winnerEntry.player_id,
      round_count: rounds.length,
    };

    const tournamentPlayers = players.map((player) => ({
      tournament_id: tournamentId,
      player_id: player.id,
    }));

    const scores = players.flatMap((player) =>
      rounds.map((round, index) => ({
        tournament_id: tournamentId,
        player_id: player.id,
        round_number: index + 1,
        score: round.scores[player.id] ?? 0,
      }))
    );

    const payload = {
      tournament,
      players,
      tournamentPlayers,
      scores,
    };

    axios
      .post("http://localhost:5001/api/tournaments/full", payload)
      .then((response) => {
        console.log(response.data.message);

        localStorage.removeItem("tournaments");
        localStorage.removeItem("rounds");

        navigate("/winnersPodium", { state: { topPlayers } });
      })
      .catch((error) => {
        console.error("Error saving tournament:", error);
        alert("Failed to save tournament");
      });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTournamentTitle(e.target.value);
  };

  const saveTitle = () => {
    setIsEditingTitle(false);
    localStorage.setItem("tournamentTitle", tournamentTitle);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <h2 className="text-3xl font-semibold tracking-tight mb-6">Home Page</h2>
      {currentTournament ? (
        <>
          <div className="bg-white shadow-lg rounded-lg p-6 w-[85%] max-w-5xl">
            <div className="flex justify-between items-center mb-4">
              {!isEditingTitle ? (
                <div
                  className="group flex items-center gap-2 border border-transparent hover:border-gray-500 transition-all duration-200 rounded-md p-2 cursor-pointer"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <h3 className="text-2xl font-semibold">{tournamentTitle}</h3>
                  <MdEdit className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-600" />
                </div>
              ) : (
                <input
                  type="text"
                  value={tournamentTitle}
                  onChange={handleTitleChange}
                  onBlur={saveTitle}
                  onKeyDown={(e) => e.key === "Enter" && saveTitle()}
                  className="text-2xl font-semibold border border-gray-500 rounded-md p-2 focus:outline-none focus:border-gray-700 transition-all duration-200"
                />
              )}
              <Button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition "
                onClick={addRound}
              >
                + Add Round
              </Button>
            </div>
            <div className="flex flex-row">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition mr-2"
              >
                {isEditing ? "Save Changes" : "Edit Tournament"}
              </Button>
              <Select onValueChange={setSortOrder}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort Players" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Original Order</SelectItem>
                  <SelectItem value="firstToLast">First to Last</SelectItem>
                  <SelectItem value="byId">By ID</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isEditing && (
              <Button
                onClick={handleAddNewPlayer}
                className="bg-green-500 text-white px-4 py-2 rounded-lg mb-3"
              >
                Add Player
              </Button>
            )}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 shadow-lg bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 p-3 text-center">
                      Round
                    </th>
                    {sortedPlayers.map((player: Person) => (
                      <th
                        key={player.id}
                        className="border border-gray-300 p-3 text-center"
                      >
                        {isEditing ? (
                          <div className="flex items-center space-x-2 relative">
                            <Input
                              type="text"
                              value={player.name}
                              onChange={(e) =>
                                handlePlayerNameChange(
                                  player.id,
                                  e.target.value
                                )
                              }
                              placeholder="Enter Name"
                              className="w-full p-2 border border-gray-300 rounded-lg text-center"
                            />
                            <button
                              onClick={() => handleRemovePlayer(player.id)}
                              className="remove-button absolute"
                            >
                              <FaMinus />
                            </button>
                          </div>
                        ) : (
                          <p className="font-medium font-bold">
                            {player.nickname || player.name}
                          </p>
                        )}
                      </th>
                    ))}
                    {addingPlayer && (
                      <th className="border border-gray-300 p-3 text-center">
                        <Input
                          type="text"
                          value={tempPlayerName}
                          onChange={(e) => setTempPlayerName(e.target.value)}
                          placeholder="Enter Player Name"
                          className="w-full p-2 border border-gray-300 rounded-lg text-center"
                          onBlur={handleSaveNewPlayer}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSaveNewPlayer()
                          }
                        />
                      </th>
                    )}
                    <th className="border border-gray-300 p-3 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rounds.map((round, roundIndex) => (
                    <tr key={roundIndex} className="hover:bg-gray-100">
                      <td className="border border-gray-300 p-3 text-center font-semibold">
                        {roundIndex + 1}
                      </td>
                      {sortedPlayers.map((player: Person) => (
                        <td
                          key={player.id}
                          className="border border-gray-300 p-3 text-center"
                        >
                          {isEditing ? (
                            <Input
                              type="number"
                              value={
                                round.scores[player.id] !== undefined
                                  ? String(round.scores[player.id])
                                  : ""
                              }
                              onChange={(e) =>
                                handleScoreChange(
                                  roundIndex,
                                  player.id,
                                  e.target.value
                                )
                              }
                              disabled
                              className="w-full p-2 border border-gray-300 rounded-lg text-center"
                            />
                          ) : (
                            <Input
                              type="number"
                              value={
                                round.scores[player.id] !== undefined
                                  ? String(round.scores[player.id])
                                  : ""
                              }
                              onChange={(e) =>
                                handleScoreChange(
                                  roundIndex,
                                  player.id,
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border border-gray-300 rounded-lg text-center"
                            />
                          )}
                        </td>
                      ))}
                      {addingPlayer && (
                        <td className="border border-gray-300 p-3 text-center">
                          <Input
                            type="number"
                            value=""
                            disabled
                            className="w-full p-2 border border-gray-300 rounded-lg text-center bg-gray-200"
                          />
                        </td>
                      )}
                      <td className="border border-gray-300 p-3 text-center">
                        <Button
                          onClick={() => removeRound(roundIndex)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-semibold">
                    <td className="border border-gray-300 p-3 text-center">
                      Totals:
                    </td>
                    {sortedPlayers.map((player) => (
                      <td
                        key={player.id}
                        className="border border-gray-300 p-3 text-center"
                      >
                        {rounds.reduce(
                          (total, round) =>
                            total + (round.scores[player.id] || 0),
                          0
                        )}
                      </td>
                    ))}
                    <td className="border border-gray-300 p-3 text-center"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-center mt-6">
              <Button
                onClick={onCompleteTournament}
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
              >
                Complete Tournament
              </Button>
            </div>
          </div>
          <div className="w-[85%] max-w-5xl mt-3 flex justify-start">
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
              onClick={() => navigate("/alternateHomePage")}
            >
              Go to Home
            </Button>
          </div>
        </>
      ) : (
        <AlternateHomePage />
      )}
    </div>
  );
}

export default CurrentTournament;
