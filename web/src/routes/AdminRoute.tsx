import { Navigate, Outlet } from "react-router-dom";

interface AdminRouteProps {
    role: string;
}

const AdminRoute: React.FC<AdminRouteProps> = ({
    role
}) => {

    // Route protection
    if (role !== 'admin') {
        return <Navigate to="/dashboard" replace/>
    }

    return <Outlet />
}

export default AdminRoute;