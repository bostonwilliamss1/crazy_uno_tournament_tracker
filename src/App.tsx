import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./navBar/navBar";
import StartTournament from "./tournament/tournament";
import PreviousTours from "./previousTours/previousTours";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<StartTournament />} />
        <Route path="/create-tournament" element={<StartTournament />} />
        <Route path="/stats" element={<div> WAIT</div>} />
        <Route path="/previous-tournaments" element={<PreviousTours />} />
      </Routes>
    </Router>
  );
}

export default App;
