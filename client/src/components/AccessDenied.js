import React from "react";
import { useNavigate } from "react-router-dom";

function AccessDenied() {
    const navigate = useNavigate();

    const handleBackToHome = () => {
        navigate("/");
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>У вас немає прав для доступу до цього ресурсу.</h2>
            <button onClick={handleBackToHome} style={{ padding: "10px 20px", fontSize: "16px" }}>
                Повернутися на головну сторінку
            </button>
        </div>
    );
}

export default AccessDenied;
