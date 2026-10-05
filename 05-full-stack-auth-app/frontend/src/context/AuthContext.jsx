import { createContext, useContext, useState } from "react";
import { loginUser } from "../services/api";
import { useEffect } from "react";
import { getUser } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            getUser()
                .then((res) => setUser(res.data))
                .catch(() => {
                    localStorage.removeItem('token');
                });
        }
    }, []);



    const login = async (data) => {
        const res = await loginUser(data);

        const {token, user} = res.data;

        localStorage.setItem("token", token);
        setUser(user);
        console.log("Login response user:", user);
        return user;
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);