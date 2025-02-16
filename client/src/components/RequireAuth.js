import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthProvider";

function RequireAuth({ component: Component, ...rest }) {
    const { currentUser } = useAuth();
    const location = useLocation();

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} />;
    }

    return <Component {...rest} />;
}

export default RequireAuth;
