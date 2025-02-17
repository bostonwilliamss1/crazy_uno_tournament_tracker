import { Link, useLocation } from "react-router-dom";
import "./navBar.css";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

function Navbar() {
  const location = useLocation();

  return (
    <div className="flex justify-between items-center my-5 pb-5 border-b w-auto">
      {/* Title on the left */}
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl ml-2">
        Crazy Uno Tournament Tracker
      </h1>
      <NavigationMenu>
        <NavigationMenuItem className="list-none text-3xl flex space-x-6">
          <NavigationMenuLink
            asChild
            className={`${navigationMenuTriggerStyle()} ${
              location.pathname === "/" ? "active" : ""
            }`}
          >
            <Link to="/">Home</Link>
          </NavigationMenuLink>
          <NavigationMenuLink
            asChild
            className={`${navigationMenuTriggerStyle()} ${
              location.pathname === "/create-tournament" ? "active" : ""
            }`}
          >
            <Link to="/create-tournament">Create Tournament</Link>
          </NavigationMenuLink>
          <NavigationMenuLink
            asChild
            className={`${navigationMenuTriggerStyle()} ${
              location.pathname === "/previous-tournaments" ? "active" : ""
            }`}
          >
            <Link to="/previous-tournaments">Previous Tournaments</Link>
          </NavigationMenuLink>
          <NavigationMenuLink
            asChild
            className={`${navigationMenuTriggerStyle()} ${
              location.pathname === "/stats" ? "active" : ""
            } mr-3 `}
          >
            <Link to="/stats">Tournament Statistics</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenu>
    </div>
  );
}

export default Navbar;
