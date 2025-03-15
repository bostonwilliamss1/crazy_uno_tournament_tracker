import { Person } from "../models/Person";
import { useEffect, useState } from "react";
import { Tournament } from "@/models/Tournament";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { MdEdit } from "react-icons/md";
import { FaMinus } from "react-icons/fa";
import "./currentTournament.css";

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
    setAddingPlayer(true); // Show the input field for new player
  };

  const handleSaveNewPlayer = () => {
    if (!tempPlayerName.trim()) return; // Prevent empty names

    const trimmedName = tempPlayerName.trim().toLowerCase();
    const isDuplicate = players.some(
      (p) => p.name.trim().toLowerCase() === trimmedName
    );

    if (isDuplicate) {
      alert("This player is already added to the tournament.");
      setTempPlayerName(""); // Reset input
      setAddingPlayer(false); // Hide input field
      return;
    }

    // Check if player exists in existingPlayers list
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

    setTempPlayerName(""); // Reset input
    setAddingPlayer(false); // Hide input field
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
    if (!currentTournament) {
      alert("No active tournament found.");
      return;
    }

    const formattedTournament = {
      tournamentId: currentTournament?.tournamentId || 0,
      title: currentTournament?.title || "Untitled Tournament",
      year: currentTournament?.year || new Date().getFullYear(),
      completed: true,

      people: players.reduce<{
        [key: number]: {
          name: string;
          id: number;
          rounds: { [round: number]: number };
        };
      }>((acc, player) => {
        acc[player.id] = {
          name: player.name,
          id: player.id,
          rounds: rounds.reduce<{ [round: number]: number }>(
            (roundAcc, round, roundIndex) => {
              roundAcc[roundIndex + 1] = round.scores[player.id] ?? 0;
              return roundAcc;
            },
            {}
          ),
        };
        return acc;
      }, {}),
    };
    console.log("formated tournament", formattedTournament);
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

      {currentTournament && (
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
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              onClick={addRound}
            >
              + Add Round
            </Button>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            {isEditing ? "Save Changes" : "Edit Tournament"}
          </Button>
          {isEditing && (
            <Button
              onClick={handleAddNewPlayer}
              className="ml-1 bg-green-500 text-white px-4 py-2 rounded-lg"
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
                  {players.map((player) => (
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
                              handlePlayerNameChange(player.id, e.target.value)
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
                    {players.map((player) => (
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
                  {players.map((player) => (
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
      )}
    </div>
  );
}

export default CurrentTournament;
