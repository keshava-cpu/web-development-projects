import { createBrowserRouter, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import ProtectedRoutes from "./routes/ProtectedRoutes";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to='/login' />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/signup',
        element: <Signup />,
    },
    {
        path: '/dashboard',
        element: (
            <ProtectedRoutes role='admin'>
                <Dashboard />
            </ProtectedRoutes>
        ),
    },
    {
        path: '/settings',
        element: (
            <ProtectedRoutes role='user'>
                <Settings />
            </ProtectedRoutes> 
        ),
    },
]);