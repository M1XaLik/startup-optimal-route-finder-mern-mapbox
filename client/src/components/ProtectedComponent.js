import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";
import AccessDenied from "./AccessDenied";

// Компонент ProtectedComponent для захисту маршрутів, доступних лише адміністраторам
function ProtectedComponent({ component: Component, ...rest }) {
    // Використання контексту для отримання поточного користувача
    const { currentUser } = useAuth();

    // Якщо користувач не авторизований, перенаправляє на сторінку логінізації
    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    // Якщо користувач авторизований, але не має ролі "admin", показує компонент AccessDenied
    if (currentUser && currentUser.role !== "admin") {
        return <AccessDenied />;
    }

    // Якщо користувач авторизований і має роль "admin", рендерить переданий компонент
    return <Component {...rest} />;
}

export default ProtectedComponent;
