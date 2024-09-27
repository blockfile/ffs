import React, { useContext, useState, useEffect } from "react";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import EditIcon from "@mui/icons-material/Edit";
import { WalletContext } from "../navbar/WalletContext";
import logo from "../assets/images/trendzlogo.png";
import axios from "axios";

function LeftSideBar() {
    const { walletConnected, user, updateUserProfile } =
        useContext(WalletContext);
    const [isEditing, setIsEditing] = useState(false);
    const [avatar, setAvatar] = useState(logo);
    const [isHovering, setIsHovering] = useState(false);
    const [shortAddress, setShortAddress] = useState("");

    const [formData, setFormData] = useState({
        username: "",
        age: "",
        location: "",
        gender: "",
    });

    // Function to shorten wallet address
    const shortenAddress = (address) => {
        if (!address) return "";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    useEffect(() => {
        if (user.walletAddress) {
            setShortAddress(shortenAddress(user.walletAddress));

            const fetchUserData = async () => {
                try {
                    const response = await axios.get(
                        `http://localhost:3001/api/users/${user.walletAddress}`
                    );
                    if (response.data) {
                        const userData = response.data;
                        setAvatar(userData.avatar || logo); // Set avatar
                        setFormData({
                            username: userData.username || "",
                            age: userData.age || "",
                            location: userData.location || "",
                            gender: userData.gender || "",
                        });
                    } else {
                        setAvatar(logo); // Default to logo if no avatar is set
                    }
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                    setAvatar(logo); // Default to logo on error
                }
            };

            fetchUserData();
        }
    }, [user.walletAddress, user]); // Added 'user' as a dependency to re-run effect on updates

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSaveClick = async () => {
        try {
            const response = await axios.post(
                "http://localhost:3001/api/users/update-profile",
                {
                    walletAddress: user.walletAddress,
                    username: formData.username,
                    age: formData.age,
                    location: formData.location,
                    gender: formData.gender,
                }
            );

            updateUserProfile(response.data.user); // Update context
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update profile:", error);
            alert("Failed to update profile. Please try again.");
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onloadend = async () => {
            const base64String = reader.result;

            try {
                const response = await axios.post(
                    "http://localhost:3001/api/users/upload-avatar",
                    {
                        walletAddress: user.walletAddress,
                        avatarData: base64String,
                    }
                );

                setAvatar(response.data.avatar);
            } catch (error) {
                console.error("Failed to upload avatar:", error);
                alert("Failed to upload avatar. Please try again.");
            }
        };

        if (file) {
            reader.readAsDataURL(file);
        }
    };

    const displayName =
        formData.username && formData.username !== user.walletAddress
            ? formData.username
            : shortAddress;

    if (!walletConnected) {
        return (
            <div className="text-white p-5 rounded-lg bg-gray-800">
                <p className="text-center text-lg">
                    Please Connect Wallet First
                </p>
            </div>
        );
    }

    return (
        <div className="text-white p-5 min-h-screen space-y-5 bg-gray-900">
            {/* Profile Section */}
            <div className="bg-gray-800 p-6 rounded-lg relative">
                <div className="flex flex-col items-center relative">
                    <label className="relative">
                        <img
                            src={avatar}
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover"
                        />
                    </label>
                    <div className="mt-4 text-center">
                        <h2 className="text-xl font-semibold">{displayName}</h2>
                        <div className="flex items-center justify-center mt-2 text-sm text-gray-400">
                            {formData.gender === "male" && (
                                <MaleIcon className="text-blue-500 mr-1" />
                            )}
                            {formData.gender === "female" && (
                                <FemaleIcon className="text-pink-500 mr-1" />
                            )}
                            <span>
                                {formData.age
                                    ? `${formData.age} years old`
                                    : "Age not set"}
                                {formData.location
                                    ? `, ${formData.location}`
                                    : ", Location not set"}
                            </span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleEditClick}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <EditIcon />
                </button>
                <div className="text-center space-y-1 mt-4">
                    <p>
                        Popularity Level: Level {user.popularityLevel || "N/A"}
                    </p>
                    <p>Following: {user.following || 0}</p>
                    <p>Followers: {user.followers || 0}</p>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-gray-800 p-6 rounded-lg w-80">
                        <h3 className="text-lg font-semibold mb-4">
                            Edit Profile
                        </h3>
                        <div className="space-y-4">
                            <div
                                className="flex flex-col items-center relative"
                                onMouseEnter={() => setIsHovering(true)}
                                onMouseLeave={() => setIsHovering(false)}>
                                <label className="relative cursor-pointer">
                                    <img
                                        src={avatar}
                                        alt="Profile"
                                        className="w-20 h-20 rounded-full object-cover"
                                    />
                                    {isHovering && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                            <span className="text-white text-sm text-center">
                                                Change Avatar
                                            </span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarUpload}
                                    />
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm mb-1">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">
                                    Age
                                </label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    className="w-full p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    className="w-full p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">
                                    Gender
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className="w-full p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end mt-6 space-x-3">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500">
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveClick}
                                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Trending Topics Section */}
            <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Trending Topics</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p>#Blockchain</p>
                        <span className="text-sm text-gray-400">
                            120k Tweets
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <p>#Web3</p>
                        <span className="text-sm text-gray-400">
                            95k Tweets
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <p>#NFT</p>
                        <span className="text-sm text-gray-400">
                            80k Tweets
                        </span>
                    </div>
                </div>
            </div>

            {/* Trending Users Section */}
            <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Trending Users</h3>
                <div className="space-y-3">
                    <div className="flex items-center">
                        <img
                            src="https://via.placeholder.com/40"
                            alt="@cryptoqueen"
                            className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                            <p className="font-semibold">@cryptoqueen</p>
                            <span className="text-sm text-gray-400">
                                Cryptocurrency Enthusiast
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <img
                            src="https://via.placeholder.com/40"
                            alt="@defiking"
                            className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                            <p className="font-semibold">@defiking</p>
                            <span className="text-sm text-gray-400">
                                DeFi Analyst
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <img
                            src="https://via.placeholder.com/40"
                            alt="@nftartist"
                            className="w-10 h-10 rounded-full mr-3"
                        />
                        <div>
                            <p className="font-semibold">@nftartist</p>
                            <span className="text-sm text-gray-400">
                                Digital Artist
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trending Tokens Section */}
            <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Trending Tokens</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p>$TRB</p>
                        <span className="text-sm text-green-500">+12.5%</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <p>$ETH</p>
                        <span className="text-sm text-green-500">+5.2%</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <p>$BTC</p>
                        <span className="text-sm text-red-500">-2.8%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LeftSideBar;
