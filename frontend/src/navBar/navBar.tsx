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
    <div className="bg-white shadow-md py-4 px-6 flex justify-between items-center w-full">
      {/* Title */}
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-gray-800">
        Crazy Uno Tournament Tracker
      </h1>

      {/* Navigation Links */}
      <NavigationMenu>
        <NavigationMenuItem className="list-none text-lg flex space-x-6">
          <NavigationMenuLink
            asChild
            className={`${navigationMenuTriggerStyle()} ${
              location.pathname === "/"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-700 hover:text-blue-500"
            } transition-all duration-200 pb-1`}
          >
            <Link to="/">Home</Link>
          </NavigationMenuLink>

          <NavigationMenuLink
            asChild
            className={`${navigationMenuTriggerStyle()} ${
              location.pathname === "/create-tournament"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-700 hover:text-blue-500"
            } transition-all duration-200 pb-1`}
          >
            <Link to="/create-tournament">Create Tournament</Link>
          </NavigationMenuLink>

          <NavigationMenuLink
            asChild
            className={`${navigationMenuTriggerStyle()} ${
              location.pathname === "/previous-tournaments"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-700 hover:text-blue-500"
            } transition-all duration-200 pb-1`}
          >
            <Link to="/previous-tournaments">Previous Tournaments</Link>
          </NavigationMenuLink>

          <NavigationMenuLink
            asChild
            className={`${navigationMenuTriggerStyle()} ${
              location.pathname === "/stats"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-700 hover:text-blue-500"
            } transition-all duration-200 pb-1 mr-3`}
          >
            <Link to="/stats">Tournament Statistics</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenu>
    </div>
  );
}

export default Navbar;
