import React from "react";
import { Routes, BrowserRouter, Route } from "react-router-dom";
import Locations from "./components/Locations";
import Map from "./components/Map";
import Navbar from "./Navbar";
import LocationDetails from "./components/LocationDetails";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedComponent from "./components/ProtectedComponent";
import RequireAuth from "./components/RequireAuth";
import { AuthProvider } from "./AuthProvider";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<RequireAuth component={Locations} />} />
                    <Route path="/map" element={<ProtectedComponent component={Map} />} />
                    <Route
                        path="/locations/:id"
                        element={<RequireAuth component={LocationDetails} />}
                    />
                    {/* Інші маршрути тут */}
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
