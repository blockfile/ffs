const express = require("express");
const mongoose = require("mongoose");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const axios = require("axios");
const cors = require("cors");
const path = require("path"); // Import path module
require("dotenv").config();

const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json({ limit: "50mb" })); // Parse JSON payloads
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Parse URL-encoded payloads

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
    .connect(process.env.DATABASE_ACCESS)
    .then(() => console.log("MongoDB connected..."))
    .catch((err) => console.log(err));

// Routes
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
