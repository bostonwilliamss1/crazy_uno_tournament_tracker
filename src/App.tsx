import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./navBar/navBar";
import StartTournament from "./tournament/tournament";
import PreviousTours from "./previousTours/previousTours";
import Stats from "./stats/stats";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<StartTournament />} />
        <Route path="/create-tournament" element={<StartTournament />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/previous-tournaments" element={<PreviousTours />} />
      </Routes>
    </Router>
  );
}

export default App;
