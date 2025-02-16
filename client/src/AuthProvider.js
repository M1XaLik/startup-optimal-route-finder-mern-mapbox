import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            axios
                .get(`${process.env.REACT_APP_SERVER_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((response) => {
                    console.log("User data received:", response.data.user);
                    setCurrentUser(response.data.user);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Error fetching user data:", error);
                    localStorage.removeItem("authToken");
                    setLoading(false);
                });
        } else {
            console.log("No token found in localStorage");
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        try {
            console.log("Attempting to log in with username:", username);
            const response = await axios.post(
                `${process.env.REACT_APP_SERVER_URL}/api/auth/login`,
                { username, password }
            );
            const { token, user } = response.data;
            // console.log("Login successful, token received:", token);
            localStorage.setItem("authToken", token);
            setCurrentUser(user);
        } catch (error) {
            console.error("Error during login:", error);
            throw new Error("Invalid credentials");
        }
    };

    const logout = () => {
        console.log("Logging out");
        localStorage.removeItem("authToken");
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}

export default AuthProvider;
