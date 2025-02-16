import React, { useState, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";

// НЕОБХІДНІ СТИЛІ ДЛЯ КАРТИ
import "mapbox-gl/dist/mapbox-gl.css";

// ТОКЕН ДОСТУПУ ДО MAPBOX
mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

function Map() {
    const [map, setMap] = useState(null); // Стейт для карти
    const [locations, setLocations] = useState([]); // Стейт для локацій
    const [routeCoordinates, setRouteCoordinates] = useState(null); // Стейт для координат маршруту

    // Координати для початкової та кінцевої точки маршруту (ЛНТУ)
    const startLocation = [25.296832, 50.7254396];
    const endLocation = startLocation; // Кінцева точка = початкова

    // Використовується для ініціалізації карти після першого рендеру
    useEffect(() => {
        const mapContainer = document.getElementById("map");
        mapContainer.innerHTML = "";

        const initializeMap = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/mapbox/streets-v12",
            center: [25.325383, 50.747232],
            zoom: 10,
        });

        initializeMap.on("load", () => {
            console.log("Map has been loaded");

            setMap(initializeMap); // Збереження карти в стейт

            const home = new mapboxgl.Marker({
                color: "red",
                scale: 1.5,
            })
                .setLngLat(startLocation)
                .setPopup(new mapboxgl.Popup().setText("HOME"))
                .addTo(initializeMap);

            // Отримання даних про локації з сервера з авторизацією
            const token = localStorage.getItem("authToken"); // Отримання токена з localStorage
            if (!token) {
                console.error("No auth token found");
                return;
            }
            const config = { headers: { Authorization: `Bearer ${token}` } };

            axios
                .get(`${process.env.REACT_APP_SERVER_URL}`, config)
                .then((response) => {
                    const selectedLocations = response.data.filter((loc) => loc.selected);
                    setLocations(selectedLocations);
                    console.log("Selected Locations:", selectedLocations);

                    selectedLocations.forEach((location) => {
                        console.log(
                            "Adding marker for location:",
                            location.address,
                            location.coordinates
                        );
                        const marker = new mapboxgl.Marker()
                            .setLngLat(location.coordinates)
                            .setPopup(new mapboxgl.Popup().setText(`${location.address}`))
                            .addTo(initializeMap);
                    });

                    // Отримання маршруту
                    getRoute(startLocation, endLocation, selectedLocations);
                })
                .catch((error) => {
                    console.error("Error fetching locations:", error);
                });
        });
    }, []);

    // Використовується для малювання маршруту та додавання стрілочок після отримання координат
    useEffect(() => {
        if (map && routeCoordinates) {
            drawRoute(routeCoordinates);
            addRouteArrows();
        }
    }, [map, routeCoordinates]);

    // Функція для отримання маршруту з Mapbox Directions API
    const getRoute = (start, end, locations) => {
        const coordinates = [start, ...locations.map((loc) => loc.coordinates), end];
        console.log("coordinates:", coordinates);

        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates
            .map((coord) => coord.join(","))
            .join(";")}?geometries=geojson&access_token=${mapboxgl.accessToken}&overview=full`;

        console.log("Route URL:", url);

        axios
            .get(url)
            .then((response) => {
                const routeData = response.data.routes[0]?.geometry;
                console.log("routeData:", routeData);

                if (!routeData?.coordinates) {
                    console.log("No coordinates found in routeData");
                    return;
                }

                setRouteCoordinates(routeData.coordinates);
                console.log("route data coordinates:", routeData.coordinates);
            })
            .catch((error) => {
                console.error("Error fetching route:", error);
            });
    };

    // Функція для малювання маршруту на карті
    const drawRoute = (coordinates) => {
        if (!map) {
            console.log("Map is not initialized");
            return;
        }

        if (!coordinates || coordinates.length === 0) {
            console.log("Coordinates are not available or empty");
            return;
        }

        // Видалення шару та джерела "routearrows" перед видаленням джерела "route"
        if (map.getLayer("routearrows")) {
            map.removeLayer("routearrows");
        }
        if (map.getLayer("route")) {
            map.removeLayer("route");
        }
        if (map.getSource("route")) {
            map.removeSource("route");
        }

        console.log("Adding source and layer for route");

        // Додавання джерела для маршруту
        map.addSource("route", {
            type: "geojson",
            data: {
                type: "Feature",
                geometry: {
                    type: "LineString",
                    coordinates: coordinates,
                },
            },
        });

        console.log("Source added");

        // Додавання шару для маршруту
        map.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
                "line-join": "round",
                "line-cap": "round",
            },
            paint: {
                "line-color": "#007cbf",
                "line-width": 6,
            },
        });

        console.log("Layer added");

        // Масштабуємо карту до маршруту
        const bounds = coordinates.reduce((bounds, coord) => {
            return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
        map.fitBounds(bounds, { padding: 50 });

        console.log("Bounds fit to route");
    };

    // Функція для додавання стрілочок, які показують напрямок маршруту
    const addRouteArrows = () => {
        if (!map) {
            console.log("Map is not initialized");
            return;
        }

        if (map.getLayer("routearrows")) {
            map.removeLayer("routearrows");
        }

        console.log("Adding arrows layer for route");

        // Додавання шару зі стрілочками
        map.addLayer(
            {
                id: "routearrows",
                type: "symbol",
                source: "route",
                layout: {
                    "symbol-placement": "line",
                    "text-field": "▶",
                    "text-size": ["interpolate", ["linear"], ["zoom"], 12, 24, 22, 60],
                    "symbol-spacing": ["interpolate", ["linear"], ["zoom"], 12, 30, 22, 160],
                    "text-keep-upright": false,
                    "symbol-z-order": "auto",
                },
                paint: {
                    "text-color": "#ff0000", // Яскраво червоний колір стрілочок
                    "text-opacity": 1, // Непрозорі стрілочки
                    "text-halo-color": "white",
                    "text-halo-width": 3,
                },
            },
            "route" // Додавання стрілочок поверх шару маршруту
        );

        console.log("Arrows layer added");
    };

    return <div id="map" style={{ width: "100vw", height: "100vh" }} />;
}

export default Map;
