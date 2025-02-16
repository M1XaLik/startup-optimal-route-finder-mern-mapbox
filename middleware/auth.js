const jwt = require("jsonwebtoken");
const User = require("../models/UserModel"); // Актуалізуйте шлях до моделі користувача

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader) {
            console.log("Authorization header missing");
            return res.status(401).send("Unauthorized");
        }

        const token = authHeader.replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded.userId });

        if (!user) {
            throw new Error("User not found");
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        console.error("Error during authentication:", error);
        res.status(401).send("Unauthorized");
    }
};

const admin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).send("Access denied");
    }
    next();
};

module.exports = { auth, admin };
