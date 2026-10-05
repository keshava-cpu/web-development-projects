import { Routes, Route, NavLink, Outlet } from "react-router";
import CounterPage from "./pages/CounterPage";
import Home from "./pages/Home";
import { ThemeProvider } from "@/components/ui/theme-provider"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import TicTacToe from "./pages/TicTacToe";
import { ModeToggle } from "./components/mode-toggle";



function Layout() {
  return (
    <div className="">
      <div className="flex items-center-safe justify-between">
        <h1 className="text-xl font-bold" >Nav Bar</h1>
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-mono"> Theme </h2>
          <ModeToggle />
        </div>
      </div>

      <NavigationMenu>
        <NavigationMenuList className={""}>
          <NavigationMenuItem>
            <NavigationMenuLink
              render={ <NavLink to="/" /> }
              className={navigationMenuTriggerStyle()}
              >
                Home
              </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              render={ <NavLink 
              to="/counter" /> }
              className={navigationMenuTriggerStyle()}
              >
                Counter
              </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              render={ <NavLink 
              to="tictactoe" /> }
              className={navigationMenuTriggerStyle()}
              >
                TicTacToe
              </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      

      <nav className="flex p-2 gap-5">
        <NavLink to="/" className={({ isActive }) => 
            `transition-colors hover:text-foreground/80 ${isActive ? "text-foreground font-semibold border-b-2 border-primary pb-1" : "text-muted-foreground"}`
          }>Home</NavLink>
        <NavLink 
          to="/counter" 
          className={({ isActive }) => 
            `transition-colors hover:text-foreground/80 ${isActive ? "text-foreground font-semibold border-b-2 border-primary pb-1" : "text-muted-foreground"}`
          }
        >
          Counter
        </NavLink>
        <NavLink 
          to="tictactoe" 
          className={({ isActive }) => 
            `transition-colors hover:text-foreground/80 ${isActive ? "text-foreground font-semibold border-b-2 border-primary pb-1" : "text-muted-foreground"}`
          }
        >
          TicTacToe
        </NavLink>
      </nav>
      <main className="container mx-auto mt-3">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="container mx-auto p-4">
        <Routes>
          <Route element={<Layout />}>
            <Route index element={ <Home />} />
            <Route path="counter" element={ <CounterPage /> } />
            <Route path="tictactoe" element={ <TicTacToe /> } />
          </Route>
        </Routes>
      </div>
    </ThemeProvider>
  );
}
