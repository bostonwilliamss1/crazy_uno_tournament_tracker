import { Link } from "react-router-dom";
import "./navBar.css";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

function Navbar() {
  return (
    <div className="flex justify-between items-center m-3">
      {/* Title on the left */}
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Crazy Uno Tournament Tracker
      </h1>
      <NavigationMenu>
        <NavigationMenuItem className="list-none text-3xl flex space-x-6">
          <Link to="/">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Home
            </NavigationMenuLink>
          </Link>
          <Link to="/create-tournament">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Create Tournament
            </NavigationMenuLink>
          </Link>
          <Link to="/previous-tournaments">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Previous Tournaments
            </NavigationMenuLink>
          </Link>
          <Link to="/statistics">
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Tournament Statistics
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenu>
    </div>
  );
}

export default Navbar;
