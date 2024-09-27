const mongoose = require("mongoose");
const PostSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
        type: String,
        enum: ["Photo/Video", "Airdrop", "Token", "NFT", "Token Swap"],
        required: true,
    },
    description: { type: String, required: true },
    media: [{ type: String }],
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Reference to User model
    likes: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
