const mongoose = require("mongoose");

const MediaSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    url: { type: String, required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    uploadedAt: { type: Date, default: Date.now },
});

const Media = mongoose.model("Media", MediaSchema);
module.exports = Media;
