import './navBar.css';
import logo from "../assets/crazyUnoTournamentLogo.png";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-title">
       <img src={logo} alt="crazy uno logo"></img>
      </div>
      <ul className="navbar-links">
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
        <li><a href="/login">Login</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;