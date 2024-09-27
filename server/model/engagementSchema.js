const mongoose = require("mongoose");

const EngagementSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
        type: String,
        enum: ["Like", "Comment", "Forward", "Donate"],
        required: true,
    },
    createdAt: { type: Date, default: Date.now },
});

const Engagement = mongoose.model("Engagement", EngagementSchema);
module.exports = Engagement;
