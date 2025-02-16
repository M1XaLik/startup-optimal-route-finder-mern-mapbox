const express = require("express");
const router = express.Router();
const Location = require("./models/LocationModel");

const { auth, admin } = require("./middleware/auth"); // Імпорт middleware

// Отримання всіх локацій
router.get("/", async (req, res) => {
    try {
        const locations = await Location.find();
        res.json(locations);
    } catch (error) {
        console.error("Помилка при отриманні локацій:", error);
        res.status(500).json({ message: "Внутрішня помилка сервера" });
    }
});

// Додавання нової локації (лише для адміністратора)
router.post("/", auth, admin, async (req, res) => {
    try {
        const { name, address, coordinates, fillPercentage } = req.body; // Додано fillPercentage
        const newLocation = new Location({
            name: name,
            address: address,
            coordinates: coordinates,
            fillPercentage: fillPercentage, // Додано fillPercentage
        });
        await newLocation.save();
        res.json(newLocation);
    } catch (error) {
        console.error("Помилка при додаванні нової локації:", error);
        res.status(500).json({ message: "Внутрішня помилка сервера" });
    }
});

// Оновлення локації
router.patch("/locations/:id", auth, async (req, res) => {
    try {
        const locationId = req.params.id;
        const updates = req.body;
        console.log(`Received PATCH request for location ${locationId} with updates:`, updates);
        const location = await Location.findByIdAndUpdate(locationId, updates, { new: true });
        if (!location) {
            return res.status(404).send("Location not found");
        }
        console.log(`Location updated: ${locationId}, selected: ${location.selected}`);
        res.status(200).send(location);
    } catch (error) {
        console.error("Error updating location:", error); // LOG ERROR IF UPDATE FAILS
        res.status(500).send("Internal Server Error");
    }
});

// Видалення локації
router.delete("/locations/:id", [auth, admin], async (req, res) => {
    try {
        const locationId = req.params.id;
        console.log("Attempting to delete location with ID:", locationId); // Логування ID локації
        const location = await Location.findByIdAndDelete(locationId);
        if (!location) {
            console.log("Location not found");
            return res.status(404).send("Location not found");
        }
        console.log("Location deleted:", location);
        res.status(200).send("Location deleted");
    } catch (error) {
        console.error("Error deleting location:", error); // Логування помилки
        res.status(500).send("Internal Server Error");
    }
});
module.exports = router;

// Отримання детальної інформації про локацію
router.get("/locations/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const location = await Location.findById(id);
        res.json(location);
    } catch (error) {
        console.error("Помилка при отриманні детальної інформації про локацію:", error);
        res.status(500).json({ message: "Внутрішня помилка сервера" });
    }
});

module.exports = router;
