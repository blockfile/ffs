const mongoose = require("mongoose");

const DiscussionSchema = new mongoose.Schema({
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    messages: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            content: { type: String },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    createdAt: { type: Date, default: Date.now },
});

const Discussion = mongoose.model("Discussion", DiscussionSchema);
module.exports = Discussion;
