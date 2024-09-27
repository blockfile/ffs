const express = require("express");
const router = express.Router();
const User = require("../model/userSchema");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
// Set up multer for storing uploaded files (not changed from before)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, "..", "uploads", "avatars");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage: storage });

// Route to handle wallet connection and save wallet address
router.post("/connect-wallet", async (req, res) => {
    const { walletAddress, age, location, gender } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
    }

    try {
        let user = await User.findOne({ walletAddress });

        if (!user) {
            // If no user with this wallet address, create a new one with provided details
            user = new User({
                username: walletAddress,
                walletAddress: walletAddress,
                age: age || null,
                avatar: "",
                location: location || "",
                gender: gender || "other",
            });
        }

        // Save the user document with the wallet address and other details
        await user.save();
        res.status(200).json({ message: "Wallet connected and saved", user });
    } catch (err) {
        console.error("Error in /connect-wallet route:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/:walletAddress", async (req, res) => {
    const walletAddress = req.params.walletAddress;

    console.log("Fetching user data for wallet address:", walletAddress);

    try {
        const user = await User.findOne({
            walletAddress: {
                $regex: new RegExp("^" + walletAddress + "$", "i"),
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (err) {
        console.error("Error fetching user data:", err);
        res.status(500).json({ error: "Server error" });
    }
});
// Avatar upload route (remains unchanged)

router.post("/upload-avatar", async (req, res) => {
    const { walletAddress, avatarData } = req.body;

    if (!walletAddress || !avatarData) {
        return res
            .status(400)
            .json({ message: "Wallet address and avatar data are required" });
    }

    console.log("Received wallet address:", walletAddress);

    try {
        // Use a case-insensitive search for the wallet address
        const user = await User.findOne({
            walletAddress: {
                $regex: new RegExp("^" + walletAddress + "$", "i"),
            },
        });

        if (!user) {
            console.log("User not found for wallet address:", walletAddress);
            return res.status(404).json({ message: "User not found" });
        }

        // Update the avatar with the base64 string
        user.avatar = avatarData;
        await user.save(); // Save the updated user document

        res.json({
            message: "Avatar updated successfully",
            avatar: user.avatar,
        });
    } catch (err) {
        console.error("Error uploading avatar:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/update-profile", async (req, res) => {
    const { walletAddress, username, age, location, gender } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ error: "Wallet address is required" });
    }

    try {
        // Find the user by wallet address
        const user = await User.findOne({
            walletAddress: {
                $regex: new RegExp("^" + walletAddress + "$", "i"),
            },
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update user details
        user.username = username || user.username;
        user.age = age !== undefined ? age : user.age;
        user.location = location || user.location;
        user.gender = gender || user.gender;

        await user.save(); // Save the updated user document

        res.json({ message: "Profile updated successfully", user });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ error: "Server error" });
    }
});

router.post("/follow", async (req, res) => {
    const { followerId, followeeWallet } = req.body;

    try {
        const follower = await User.findById(followerId);
        const followee = await User.findOne({ walletAddress: followeeWallet });

        if (!follower || !followee) {
            return res.status(404).json({ error: "User not found" });
        }

        if (follower.following.includes(followee._id)) {
            // Unfollow
            follower.following.pull(followee._id);
            followee.followers.pull(follower._id);
        } else {
            // Follow
            follower.following.push(followee._id);
            followee.followers.push(follower._id);
        }

        await follower.save();
        await followee.save();

        res.status(200).json({
            success: true,
            message: "Follow/unfollow updated",
        });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});
// In your routes file

router.post("/update-bio", async (req, res) => {
    const { walletAddress, bio } = req.body;

    if (!walletAddress || !bio) {
        return res
            .status(400)
            .json({ error: "Wallet address and bio are required." });
    }

    try {
        // Find the user by wallet address
        const user = await User.findOne({ walletAddress });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update the bio
        user.bio = bio;
        await user.save();

        res.status(200).json({ success: true, bio: user.bio });
    } catch (err) {
        console.error("Error updating bio:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
