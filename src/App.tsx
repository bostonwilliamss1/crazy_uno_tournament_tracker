import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./navBar/navBar";
import CreateTournament from "./createTournament/createTournament";
import PreviousTours from "./previousTours/previousTours";
import Stats from "./stats/stats";
import CurrentTournament from "./currentTournament/currentTournament";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<CurrentTournament />} />
        <Route path="/create-tournament" element={<CreateTournament />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/previous-tournaments" element={<PreviousTours />} />
      </Routes>
    </Router>
  );
}

export default App;
