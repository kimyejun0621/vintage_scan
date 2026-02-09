import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Scanner from "./pages/Scanner";
import Results from "./pages/Results";
import Pricing from "./pages/Pricing";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/app",
    Component: Home,
  },
  {
    path: "/scan/:brand",
    Component: Scanner,
  },
  {
    path: "/results/:brand",
    Component: Results,
  },
  {
    path: "/pricing",
    Component: Pricing,
  },
]);