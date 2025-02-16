import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";

import { useAuth } from "../AuthProvider";

// CONSTANT FOR MAPBOX ACCESS TOKEN
const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

function Locations() {
    // STATES FOR MANAGING LOCATIONS, ADDRESS, SUGGESTIONS, ERROR AND FILTER
    const [locations, setLocations] = useState([]);
    const [address, setAddress] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("");

    const { currentUser } = useAuth();

    // REMOVE TRAILING SLASHES FROM SERVER URL
    const serverURL = process.env.REACT_APP_SERVER_URL.replace(/\/+$/, "");

    // USE EFFECT TO FETCH LOCATIONS FROM SERVER WHEN COMPONENT MOUNTS
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const token = localStorage.getItem("authToken"); // Отримання токена з localStorage
                if (!token) {
                    throw new Error("No auth token found");
                }
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const response = await axios.get(serverURL, config);

                console.log("Fetched locations:", response.data);

                // Оновлення поля selected у бекенді для локацій, заповнених на 80% і більше
                const promises = response.data.map((location) => {
                    const shouldSelect = location.fillPercentage > 80;
                    if (location.selected !== shouldSelect) {
                        console.log(
                            `Updating location ${location._id} to selected: ${shouldSelect}`
                        );
                        return axios
                            .patch(
                                `${serverURL}/locations/${location._id}`,
                                { selected: shouldSelect },
                                config
                            )
                            .then((response) => {
                                console.log(
                                    `Response for location ${location._id}:`,
                                    response.data
                                );
                                return response.data;
                            })
                            .catch((error) => {
                                console.error(`Error updating location ${location._id}:`, error);
                                return location; // Повертаємо початкову локацію у випадку помилки
                            });
                    }
                    return location; // Якщо немає змін, повертаємо початкову локацію
                });

                const updatedLocations = await Promise.all(promises);
                setLocations(updatedLocations); // SET LOCATIONS STATE
            } catch (error) {
                console.error("Error fetching locations:", error); // LOG ERROR IF FETCH FAILS
            }
        };

        fetchLocations();
    }, [serverURL]);

    // HANDLER FOR ADDRESS INPUT CHANGE
    const handleAddressChange = (e) => setAddress(e.target.value);

    // HANDLER FOR FILTER INPUT CHANGE
    const handleFilterChange = (e) => setFilter(e.target.value);

    // HANDLER FOR AUTOCOMPLETE SUGGESTIONS
    const handleAddressAutocomplete = async (e) => {
        const value = e.target.value;
        setAddress(value);

        if (value.length > 3) {
            const response = await axios.get(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    `${value}, Ukraine`
                )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&autocomplete=true&country=UA`
            );

            // Форматування адреси
            const suggestions = response.data.features.map((suggestion) => {
                const placeParts = suggestion.place_name.split(", ");
                const country = placeParts.pop();
                const region = placeParts.pop();
                const city = placeParts.pop();
                const address = placeParts.join(", ");
                return {
                    ...suggestion,
                    formatted_address: `${address}, ${city}, ${region}, ${country}`,
                };
            });

            setSuggestions(suggestions); // SET SUGGESTIONS STATE
        } else {
            setSuggestions([]); // CLEAR SUGGESTIONS IF INPUT LENGTH IS LESS THAN 3
        }
    };

    // HANDLER FOR SELECTING AUTOCOMPLETE SUGGESTION
    const selectSuggestion = (suggestion) => {
        const formattedAddress = suggestion.formatted_address;
        setAddress(formattedAddress); // SET ADDRESS STATE TO SELECTED SUGGESTION
        setSuggestions([]); // CLEAR SUGGESTIONS
    };

    // FUNCTION TO ADD NEW LOCATION
    const addLocation = async () => {
        if (!address) {
            setError("Будь ласка, введіть адресу.");
            console.error("Add Location Error: Address is empty.");
            return;
        }

        try {
            const token = localStorage.getItem("authToken"); // Отримання токена з localStorage
            if (!token) {
                throw new Error("No auth token found");
            }
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const geocodeResponse = await axios.get(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    address
                )}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
            );

            const coordinates = geocodeResponse.data.features[0]?.center;
            if (!coordinates) {
                setError("Адресу не знайдено. Будь ласка, перевірте введення.");
                console.error("Add Location Error: Coordinates not found.");
                return;
            }

            setError(""); // CLEAR ERROR

            const response = await axios.post(
                `${serverURL}/`,
                {
                    address,
                    coordinates,
                    fillPercentage: 0,
                },
                config
            );

            setLocations([...locations, response.data]); // UPDATE LOCATIONS STATE WITH NEW LOCATION
            setAddress(""); // CLEAR ADDRESS INPUT
        } catch (error) {
            setError("Не вдалося додати локацію. Будь ласка, спробуйте ще раз.");
            console.error("Add Location Error:", error);
        }
    };

    // FUNCTION TO TOGGLE SELECTION STATUS OF LOCATION
    const toggleSelection = (id, selected) => {
        if (currentUser && currentUser.role !== "admin") {
            return; // Звичайні користувачі не можуть змінювати статус
        }

        const token = localStorage.getItem("authToken"); // Отримання токена з localStorage
        if (!token) {
            console.error("No auth token found");
            return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };

        axios
            .patch(`${serverURL}/locations/${id}`, { selected: !selected }, config)
            .then(() => {
                setLocations(
                    locations.map((loc) => (loc._id === id ? { ...loc, selected: !selected } : loc)) // UPDATE LOCATIONS STATE
                );
            })
            .catch((error) => {
                console.error("Error updating location:", error); // LOG ERROR IF UPDATE FAILS
            });
    };

    const deleteLocation = async (id) => {
        try {
            const token = localStorage.getItem("authToken"); // Отримання токена з localStorage
            if (!token) {
                throw new Error("No auth token found");
            }
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${serverURL}/locations/${id}`, config);
            setLocations(locations.filter((loc) => loc._id !== id));
        } catch (error) {
            console.error("Error deleting location:", error);
        }
    };

    return (
        <div className="locations-container">
            <h1>Сторінка локацій</h1>
            {currentUser && currentUser.role === "admin" && (
                <div>
                    <div className="form-group">
                        <label>Адреса</label>
                        <input
                            type="text"
                            placeholder="Введіть адресу (напр.: вул. Львівська, Луцьк)"
                            value={address}
                            onChange={handleAddressAutocomplete}
                        />
                    </div>
                    <ul className="suggestions">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={suggestion.id ? suggestion.id : `suggestion-${index}`}
                                onClick={() => selectSuggestion(suggestion)}
                            >
                                {suggestion.place_name}
                            </li>
                        ))}
                    </ul>
                    <button onClick={addLocation}>Додати локацію</button>{" "}
                    {error && <p className="error">{error}</p>}
                    <br />
                </div>
            )}
            <h2>Список:</h2>
            <div className="form-group">
                <input
                    type="text"
                    value={filter}
                    onChange={handleFilterChange}
                    placeholder="ПОШУК"
                />
            </div>
            <ul className="location-list">
                {locations
                    .filter(
                        (location) => location.address.toLowerCase().includes(filter.toLowerCase()) // FILTER LOCATIONS BASED ON SEARCH INPUT
                    )
                    .map((location) => (
                        <li key={location._id} className="location-item">
                            <label className="checkbox-container">
                                <input
                                    type="checkbox"
                                    checked={location.selected}
                                    onChange={() =>
                                        toggleSelection(location._id, location.selected)
                                    }
                                />
                                <span className="checkmark"></span>
                            </label>
                            <Link to={`/locations/${location._id}`} className="location-link">
                                <div className="location-info">
                                    <h3>{location.address}</h3>
                                    <p className="fill-percentage">
                                        {" "}
                                        {`Заповненість: ${location.fillPercentage}%`}{" "}
                                    </p>{" "}
                                </div>
                            </Link>
                            {currentUser && currentUser.role === "admin" && (
                                <button
                                    className="delete-button"
                                    onClick={() => deleteLocation(location._id)}
                                >
                                    <FaTrash />
                                </button>
                            )}
                        </li>
                    ))}
            </ul>
        </div>
    );
}

export default Locations;
