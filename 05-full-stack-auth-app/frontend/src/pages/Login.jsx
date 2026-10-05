import AuthForm from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (data) => {
        try {
            const user = await login(data);
            console.log("FULL RESPONSE:", res.data);

            if (user.role === 'admin') 
                navigate("/dashboard");
            else 
                navigate("/settings");
        } catch (err) {
            console.log(err);
        }
    };

    return <AuthForm type="login" onSubmit={handleLogin} />;
}
