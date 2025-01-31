import axios from "axios";
import { SetStateAction, useEffect, useState } from "react";
import { Tournament } from "../models/Tournament";

type Option = {
  title: string;
};

function PreviousTours() {
  const [selectedTournament, setSelectedTournament] = useState(" ");
  const [options, setOptions] = useState<Option[]>([]);
  const [tournamentsInformation, setTournamentsInformation] =
    useState<Tournament[]>();

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/tournaments-titles")
      .then((response) => {
        setOptions(response.data);
      })
      .catch((error) => {
        console.error("Error fetching tournament titles:", error);
      });
  }, [options]);

  useEffect(() => {
    axios
      .get("http://localhost:5001/api/tournaments")
      .then((response) => setTournamentsInformation(response.data))
      .catch((error) => console.error("Error fetching scores:", error));
  }, [tournamentsInformation]);

  const handleOptionChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setSelectedTournament(event.target.value);
  };

  return (
    <>
      <h1>Previous Tournaments</h1>
      <select value={selectedTournament} onChange={handleOptionChange}>
        <option value="">Select Tournament</option>
        {options.map((option, index) => (
          <option key={index} value={option.title}>
            {option.title}
          </option>
        ))}
      </select>
      <h3>Selected Tournament</h3>
      <p>{selectedTournament}</p>
      {tournamentsInformation?.map((tournament) => {
        //{tournament.title === selectedTournament ? (<div>{tournament.players.map((player) =>( <div>{player.name}</div>))}</div>) : <div></div>}
      })}
    </>
  );
}

export default PreviousTours;
