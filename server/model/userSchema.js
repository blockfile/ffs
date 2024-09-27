const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String },
    avatar: { type: String }, // URL to the user's avatar
    walletAddress: { type: String }, // For blockchain integration
    age: { type: Number }, // Age of the user
    location: { type: String }, // Location of the user
    gender: { type: String, enum: ["male", "female", "other"] }, // Gender of the user
    bio: { type: String }, // New field for the user bio
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
