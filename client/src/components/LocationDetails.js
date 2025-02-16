import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa"; // Import trash icon from react-icons/fa

import { useAuth } from "../AuthProvider";

function LocationDetails() {
    const { id } = useParams(); // Get ID from URL parameters
    const navigate = useNavigate(); // Used for navigation
    const [location, setLocation] = useState(null); // State to store location data
    const [loading, setLoading] = useState(true); // State to handle loading status
    const [error, setError] = useState(null); // State to handle errors
    const [fillPercentage, setFillPercentage] = useState(0); // State to handle fill percentage
    const [successMessage, setSuccessMessage] = useState(""); // State to handle success message
    const { currentUser } = useAuth();

    useEffect(() => {
        // Fetch location data based on ID
        axios
            .get(`${process.env.REACT_APP_SERVER_URL}/locations/${id}`)
            .then((response) => {
                setLocation(response.data); // Set location data
                setFillPercentage(response.data.fillPercentage); // Set fill percentage
                setLoading(false); // Set loading to false
            })
            .catch((error) => {
                setError("Помилка при отриманні даних локації."); // Set error message
                setLoading(false); // Set loading to false
                console.error("Error fetching location data:", error); // Log error
            });
    }, [id]);

    const deleteLocation = () => {
        // Delete request to remove location
        axios
            .delete(`${process.env.REACT_APP_SERVER_URL}/locations/${id}`)
            .then(() => {
                navigate("/"); // Redirect to home page after deletion
            })
            .catch((error) => {
                console.error("Error deleting location:", error); // Log error if delete fails
            });
    };

    const updateFillPercentage = async () => {
        try {
            const token = localStorage.getItem("authToken"); // Отримання токена з localStorage
            if (!token) {
                throw new Error("No auth token found");
            }
            const config = { headers: { Authorization: `Bearer ${token}` } };
            console.log("Updating fill percentage with config:", config);
            const response = await axios.patch(
                `${process.env.REACT_APP_SERVER_URL}/locations/${id}`,
                { fillPercentage },
                config
            );
            console.log(`Response for updating fill percentage of location ${id}:`, response.data);
            setSuccessMessage("Заповненість успішно оновлено!");
        } catch (error) {
            console.error("Error updating fill percentage:", error);
            setError("Не вдалося оновити заповненість.");
        }
    };

    if (loading) return <p>Завантаження...</p>; // Show loading message
    if (error) return <p>{error}</p>; // Show error message

    return (
        <div className="location-details">
            <h1>{location.address}</h1>
            <p>
                <strong>Координати:</strong> {location.coordinates.join(", ")}
            </p>
            <p>
                <strong>Відсоток заповнення:</strong>{" "}
                <span className="fill-percentage">{fillPercentage}%</span>
            </p>
            <hr />
            <div className="fill-percentage-background">
                <label>Оновити відсоток заповнення: </label>
                <input
                    type="number"
                    value={fillPercentage}
                    onChange={(e) => setFillPercentage(Number(e.target.value))} // Update fill percentage state
                    min="0"
                    max="100"
                />
                <button className="update-button" onClick={updateFillPercentage}>
                    Оновити
                </button>
            </div>
            {successMessage && <p className="success-message">{successMessage}</p>}{" "}
            {currentUser && currentUser.role === "admin" && (
                <div>
                    {" "}
                    <hr /> <p>Видалити локацію</p>{" "}
                    <button className="delete-button-location-page" onClick={deleteLocation}>
                        {" "}
                        <FaTrash />{" "}
                    </button>{" "}
                </div>
            )}
        </div>
    );
}

export default LocationDetails;
