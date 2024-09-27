import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom"; // To access URL parameters
import { WalletContext } from "../navbar/WalletContext";
import axios from "axios";
import Sidebar from "../navbar/sidebar";
import logo from "../assets/images/trendzlogo.png";
import {
    FaThumbsUp,
    FaRetweet,
    FaComment,
    FaRegBookmark,
} from "react-icons/fa";

function Profile() {
    const { user } = useContext(WalletContext); // Access the wallet context
    const { walletAddress } = useParams(); // Get wallet address from URL
    const [profileData, setProfileData] = useState({
        username: "",
        bio: "",
        avatar: "",
        followers: 0,
        following: 0,
        createdAt: "",
    });
    const [isFollowing, setIsFollowing] = useState(false);
    const [posts, setPosts] = useState([]); // Store user's posts
    const [isDialogOpen, setIsDialogOpen] = useState(false); // Add state for the image modal
    const [selectedPost, setSelectedPost] = useState(null); // Store the selected post for the image modal

    // State for bio editing
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [newBio, setNewBio] = useState(profileData.bio);

    // Function to shorten the wallet address
    const shortenAddress = (address) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    // Check if the current profile is the logged-in user's profile
    const isOwnProfile = walletAddress === user.walletAddress;

    // Fetch the profile data and posts
    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:3001/api/users/${walletAddress}` // Use the walletAddress from the URL
                );
                if (response.data) {
                    setProfileData({
                        username: response.data.username,
                        bio: response.data.bio || "No bio set.",
                        avatar: response.data.avatar || logo,
                        followers: response.data.followers.length,
                        following: response.data.following.length,
                        createdAt: new Date(
                            response.data.createdAt
                        ).toLocaleDateString(),
                    });
                    // Check if the current user is following this profile
                    setIsFollowing(response.data.followers.includes(user._id));
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);
            }
        };

        const fetchUserPosts = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:3001/api/posts/user/${walletAddress}` // Use the walletAddress from the URL
                );
                if (response.data) {
                    setPosts(response.data); // Set the posts
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
            }
        };

        fetchProfileData();
        fetchUserPosts();
    }, [walletAddress, user.walletAddress]);

    const handleFollow = async () => {
        if (!user || !user._id) {
            console.error("User ID is missing. Cannot follow/unfollow.");
            return;
        }

        try {
            const response = await axios.post(
                "http://localhost:3001/api/users/follow",
                {
                    followerId: user._id, // Pass logged-in user _id
                    followeeWallet: walletAddress, // Wallet address of the profile being viewed
                }
            );

            if (response.data.success) {
                setIsFollowing((prev) => !prev);
                setProfileData((prevData) => ({
                    ...prevData,
                    followers: isFollowing
                        ? prevData.followers - 1
                        : prevData.followers + 1,
                }));
            }
        } catch (error) {
            console.error("Error in follow/unfollow:", error);
        }
    };

    // Handle bio edit
    const handleBioEdit = () => {
        setIsEditingBio(true); // Enable editing mode
        setNewBio(profileData.bio); // Set current bio to state
    };

    // Handle bio save
    const handleBioSave = async () => {
        try {
            const response = await axios.post(
                "http://localhost:3001/api/users/update-bio",
                {
                    walletAddress: user.walletAddress,
                    bio: newBio,
                }
            );

            if (response.data.success) {
                setProfileData((prevData) => ({
                    ...prevData,
                    bio: newBio,
                }));
                setIsEditingBio(false); // Exit editing mode
            }
        } catch (error) {
            console.error("Error saving bio:", error);
        }
    };

    // Handle image click to open modal
    const handleImageClick = (post) => {
        setSelectedPost(post);
        setIsDialogOpen(true);
    };

    // Close the image modal
    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setSelectedPost(null);
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen">
            <Sidebar />
            <div className="flex justify-center mt-1 p-4">
                <div className="w-1/3 mx-auto">
                    <div className="relative">
                        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                        <img
                            src={profileData.avatar}
                            alt="User Avatar"
                            className="w-32 h-32 rounded-full absolute -bottom-16 left-8 border-4 border-gray-900 object-cover"
                        />
                    </div>

                    {/* Profile Information */}
                    <div className="p-8 pt-20">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold">
                                    {profileData.username}
                                </h1>
                                <p className="text-gray-400">
                                    @{shortenAddress(walletAddress)}{" "}
                                    {/* Shortened wallet address */}
                                </p>
                                <p className="text-gray-400">
                                    Joined {profileData.createdAt}
                                </p>
                            </div>
                            {!isOwnProfile && ( // Hide follow button for own profile
                                <button
                                    onClick={handleFollow}
                                    className={`px-4 py-2 text-sm font-medium ${
                                        isFollowing
                                            ? "bg-gray-700 text-white"
                                            : "bg-blue-600 text-white"
                                    } rounded-full`}>
                                    {isFollowing ? "Unfollow" : "Follow"}
                                </button>
                            )}
                        </div>

                        {/* Bio Section */}
                        <div className="mt-4">
                            {isEditingBio ? (
                                <>
                                    <textarea
                                        value={newBio}
                                        onChange={(e) =>
                                            setNewBio(e.target.value)
                                        }
                                        className="bg-gray-700 text-white rounded p-2 w-full"
                                    />
                                    <button
                                        className="bg-blue-500 text-white rounded-full px-4 py-2 mt-2"
                                        onClick={handleBioSave}>
                                        Save Bio
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p className="mt-4">{profileData.bio}</p>
                                    {isOwnProfile && (
                                        <button
                                            className="bg-blue-500 text-white rounded-full px-4 py-2 mt-2"
                                            onClick={handleBioEdit}>
                                            Edit Bio
                                        </button>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Follower and Following Section */}
                        <div className="flex space-x-8 mt-4 text-gray-400">
                            <div>
                                <span className="font-bold text-white">
                                    {profileData.following}
                                </span>{" "}
                                Following
                            </div>
                            <div>
                                <span className="font-bold text-white">
                                    {profileData.followers}
                                </span>{" "}
                                Followers
                            </div>
                        </div>
                    </div>
                    <hr className="border-gray-700 my-4" />
                    {/* Posts Section */}
                    <div className="mt-2">
                        <h2 className="text-2xl font-semibold mb-4">Posts</h2>
                        {posts.length > 0 ? (
                            posts.map((post, index) => (
                                <React.Fragment key={index}>
                                    <div className="mb-4">
                                        <div className="flex items-center">
                                            <img
                                                src={
                                                    post.user &&
                                                    post.user.avatar
                                                        ? post.user.avatar
                                                        : logo
                                                }
                                                alt="User"
                                                className="w-10 h-10 rounded-full"
                                            />
                                            <div className="ml-3">
                                                <p className="text-white font-bold">
                                                    {post.user &&
                                                    post.user.username
                                                        ? post.user.username
                                                        : "Unknown User"}
                                                </p>
                                                <p className="text-gray-400 text-sm">
                                                    {new Date(
                                                        post.createdAt
                                                    ).toLocaleDateString()}
                                                </p>
                                                <div className="flex items-center mt-2 space-x-2">
                                                    <span className="bg-gray-700 text-white rounded-full px-3 py-1 text-sm">
                                                        {post.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <p className="text-white text-justify mb-3">
                                                {post.description}
                                            </p>
                                            {Array.isArray(post.media) &&
                                                post.media.length > 0 && (
                                                    <img
                                                        src={`http://localhost:3001${post.media[0]}`}
                                                        alt="Post image"
                                                        className="w-full max-h-96 object-contain rounded-lg cursor-pointer"
                                                        onClick={() =>
                                                            handleImageClick(
                                                                post
                                                            )
                                                        }
                                                    />
                                                )}
                                        </div>

                                        {/* Buttons Section */}
                                        <div className="flex justify-around items-center mt-2 text-gray-400">
                                            <div className="flex items-center space-x-2">
                                                <FaComment />
                                                <span>27</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <FaRetweet />
                                                <span>10</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <FaThumbsUp />
                                                <span>{post.likes}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <FaRegBookmark />
                                            </div>
                                        </div>
                                    </div>
                                    <hr className="border-gray-700 my-4" />{" "}
                                    {/* Divider */}
                                </React.Fragment>
                            ))
                        ) : (
                            <p>No posts available</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Popup Dialog */}
            {isDialogOpen && selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="bg-gray-900 p-5 rounded-lg w-full max-w-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <img
                                    src={selectedPost.user.avatar || logo}
                                    alt="User"
                                    className="w-10 h-10 rounded-full"
                                />
                                <p className="ml-3 text-white">
                                    @{selectedPost.user.username}
                                </p>
                            </div>
                            <button
                                className="text-white hover:text-gray-400"
                                onClick={handleDialogClose}>
                                Close
                            </button>
                        </div>
                        <div className="flex justify-center">
                            <img
                                src={`http://localhost:3001${selectedPost.media[0]}`}
                                alt="Post image"
                                className="rounded-lg max-w-full max-h-96 object-contain"
                            />
                        </div>
                        <p className="text-white mt-4">
                            {selectedPost.description}
                        </p>
                        {/* Buttons in the modal */}
                        <div className="flex justify-around items-center mt-2 text-gray-400">
                            <div className="flex items-center space-x-2">
                                <FaComment />
                                <span>27</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FaRetweet />
                                <span>10</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FaThumbsUp />
                                <span>{selectedPost.likes}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FaRegBookmark />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;
