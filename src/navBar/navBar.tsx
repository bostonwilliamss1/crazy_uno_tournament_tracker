import { Link } from "react-router-dom";
import './navBar.css';
import logo from "../assets/crazyUnoTournamentLogo.png";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-title">
        <img src={logo} alt="crazy uno logo"></img>
      </div>
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/create-tournament">Create Tournament</Link></li>
        <li><Link to="/stats">Stats</Link></li>
        <li><Link to="/previous-tournaments">Previous Tournaments</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
