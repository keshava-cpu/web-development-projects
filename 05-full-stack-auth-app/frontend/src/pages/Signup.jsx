import AuthForm from "../components/AuthForm";
import { signupUser } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
    const navigate = useNavigate();

    const handleSignup = async (data) => {
        try {
            await signupUser(data);
            navigate('/login');
        } catch (err) {
            console.log("error:", err);
        }
    };

    return <AuthForm type="signup" onSubmit={handleSignup} />;
}