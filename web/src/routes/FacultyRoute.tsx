import { Navigate,Outlet } from "react-router-dom";

interface FacultyRouteProps {
    role: string;
}

const FacultyRoute: React.FC<FacultyRouteProps> = ({
    role
}) => {
    // Route Protection
    if (role !== 'faculty') {
        return <Navigate to="/admin" replace />
    }

    return <Outlet />
}

export default FacultyRoute;