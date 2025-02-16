require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// USED TO GET IP ADDRESS
const os = require("os");
// USED TO PAINT TEXT IN THE CONSOLE
const chalk = require("chalk");

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES
const routes_locations = require("./routes");
const authRoutes = require("./routesAuth"); // Імпорт нових маршрутів
const { auth, admin } = require("./middleware/auth"); // Імпорт middleware

app.use("/", routes_locations);
app.use("/api/auth", authRoutes); // Використання маршрутів для автентифікації
app.use("/api/admin", [auth, admin], (req, res) => {
    res.send("Admin access");
});

//USE DATA FROM HTML FORM
app.use(express.urlencoded({ extended: true }));

// middleware to allow Cross-Origin Resource Sharing fetch (CORS)
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", `${process.env.CLIENT_IP_ADDRESS}`); // Access to domain resources
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // methods
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Origin, Accept"); // specifying the request type and headers
    res.setHeader("Access-Control-Allow-Credentials", "true"); // can requests transmit cookies, etc
    next();
});

const getLocalIPAddress = () => {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
        for (const iface of interfaces[interfaceName]) {
            if (iface.family === "IPv4" && !iface.internal) {
                return iface.address;
            }
        }
    }
    return "localhost";
};

// Підключення до MongoDB
mongoose
    .connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log(chalk.cyanBright("MongoDB connected")))
    .catch((err) => console.error("\nMongoDB connection error:\n", err));

// Запуск сервера
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    const ip = getLocalIPAddress();
    console.log(
        chalk.cyanBright(`\nServer running on port ${PORT}\n`) +
            chalk.cyanBright(`Ip = http://${ip}\n`)
    );
});
