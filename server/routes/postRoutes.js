const express = require("express");
const Post = require("../model/postSchema"); // Ensure correct path to your Post schema
const User = require("../model/userSchema"); // Ensure correct path to your User schema
const multer = require("multer");
const router = express.Router();
const mongoose = require("mongoose");
// Configure multer for file uploads
const path = require("path");
const fs = require("fs");
const slugify = require("slugify");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, "..", "uploads");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const safeFilename = slugify(file.originalname, {
            lower: true,
            strict: true,
        });
        cb(null, Date.now() + "-" + safeFilename);
    },
});

const upload = multer({ storage: storage });

// Create a new post
// Create a new post
router.post("/", upload.single("media"), async (req, res) => {
    try {
        const { user: walletAddress, type, description } = req.body;

        if (!description) {
            return res.status(400).json({ error: "Description is required" });
        }

        // Find the user by wallet address
        const user = await User.findOne({ walletAddress });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const newPost = new Post({
            user: user._id, // Store user ObjectId
            type,
            description,
            media: mediaUrl ? [mediaUrl] : [],
            likedBy: [], // Ensure likedBy is an empty array
            likes: 0,
        });

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err) {
        console.error("Error during post creation:", err.message);
        res.status(400).json({ error: err.message });
    }
});

// Like or Unlike a post
// Like or Unlike a post
router.put("/:id/like", async (req, res) => {
    try {
        const { userId } = req.body; // userId is the walletAddress
        const user = await User.findOne({ walletAddress: userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const post = await Post.findById(req.params.id).populate(
            "likedBy",
            "username avatar walletAddress"
        );
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const isLiked = post.likedBy.some((likedUser) =>
            likedUser._id.equals(user._id)
        );

        if (isLiked) {
            // Unlike the post
            post.likedBy = post.likedBy.filter(
                (likedUser) => !likedUser._id.equals(user._id)
            );
            post.likes = post.likedBy.length;
        } else {
            // Like the post
            post.likedBy.push(user._id); // Store reference to User's ObjectId
            post.likes = post.likedBy.length;
        }

        await post.save();
        res.status(200).json(post);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get("/", async (req, res) => {
    try {
        // Populate both the user field and likedBy field to get username and avatar
        const posts = await Post.find()
            .populate("user", "username avatar walletAddress")
            .populate("likedBy", "username avatar walletAddress") // Populate likedBy with user data
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});
router.post("/update-bio", async (req, res) => {
    const { walletAddress, bio } = req.body;

    if (!walletAddress || !bio) {
        return res
            .status(400)
            .json({ error: "Wallet address and bio are required" });
    }

    try {
        const user = await User.findOne({
            walletAddress: {
                $regex: new RegExp("^" + walletAddress + "$", "i"),
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.bio = bio; // Update bio
        await user.save();

        res.json({ message: "Bio updated successfully", user });
    } catch (err) {
        console.error("Error updating bio:", err);
        res.status(500).json({ error: "Server error" });
    }
});
// Get posts by walletAddress
router.get("/user/:walletAddress", async (req, res) => {
    try {
        const { walletAddress } = req.params;

        // Find the user by walletAddress
        const user = await User.findOne({ walletAddress });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find posts by user._id
        const posts = await Post.find({ user: user._id })
            .populate("user", "username avatar")
            .populate("likedBy", "username avatar walletAddress")
            .sort({ createdAt: -1 });

        res.status(200).json(posts);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
