const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
    address: String,
    coordinates: [Number],
    selected: { type: Boolean, default: false },
    fillPercentage: { type: Number, default: 0 },
});

module.exports = mongoose.model("Location", locationSchema);
