const express = require("express");
const router = express.Router();
const User = require("./models/UserModel"); // Актуалізуйте шлях до моделі користувача
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { auth, admin } = require("./middleware/auth");

// Реєстрація користувача
router.post("/register", async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        console.log("Registration attempt with:", { username, email, password, role }); // Логування переданих даних

        if (!username || !email || !password || !role) {
            console.log("Missing required fields");
            return res.status(400).send("Missing required fields");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role,
        });

        await newUser.save();
        console.log("User registered:", newUser);
        res.status(201).send("User registered");
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(400).send("Error registering user");
    }
});

// Вхід користувача
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log("Login attempt with:", { username, password }); // Логування переданих даних

        if (!username || !password) {
            console.log("Missing required fields");
            return res.status(400).send("Missing required fields");
        }

        const user = await User.findOne({ username });
        if (!user) {
            console.log("Invalid credentials: User not found");
            return res.status(400).send("Invalid credentials");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Invalid credentials: Password does not match");
            return res.status(400).send("Invalid credentials");
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        console.log("Login successful:", { token, user });
        res.json({ token, user });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(400).send("Error logging in");
    }
});

// Маршрут для отримання поточного користувача
router.get("/me", auth, async (req, res) => {
    try {
        res.json({ user: req.user });
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
