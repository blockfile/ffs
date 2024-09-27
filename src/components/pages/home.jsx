import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import Sidebar from "../navbar/sidebar";
import Rightbar from "../navbar/rightbar";
import LeftSideBar from "../navbar/leftsidebar";
import PhotoIcon from "@mui/icons-material/Photo";
import RedeemIcon from "@mui/icons-material/Redeem";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import Stories from "../stories/stories";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import CommentIcon from "@mui/icons-material/Comment";
import ShareIcon from "@mui/icons-material/Share";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import logo from "../assets/images/trendzlogo.png";
import { WalletContext } from "../navbar/WalletContext"; // Import the WalletContext

function Home() {
    const [postType, setPostType] = useState("Photo/Video");
    const [description, setDescription] = useState("");
    const [media, setMedia] = useState(null); // New state for media files
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null); // For the popup modal
    const [isDialogOpen, setIsDialogOpen] = useState(false); // For the popup modal
    const [isLikePopupOpen, setIsLikePopupOpen] = useState(false); // For the like popup
    const { user } = useContext(WalletContext); // Access the wallet context
    const [userData, setUserData] = useState({ username: "", avatar: logo }); // Store current user's data

    // Function to shorten wallet address safely
    const shortenAddress = (address) => {
        if (!address) {
            return ""; // Return an empty string if the address is undefined
        }
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    // Fetch current user data based on wallet address
    useEffect(() => {
        if (user.walletAddress) {
            axios
                .get(`http://localhost:3001/api/users/${user.walletAddress}`)
                .then((response) => {
                    if (response.data) {
                        setUserData({
                            username:
                                response.data.username || user.walletAddress,
                            avatar: response.data.avatar || logo,
                        });
                    }
                })
                .catch((error) => {
                    console.error("Error fetching user data:", error);
                    setUserData({
                        username: user.walletAddress,
                        avatar: logo,
                    });
                });
        }
    }, [user.walletAddress]);

    // Fetch posts from the server on component mount
    useEffect(() => {
        axios
            .get("http://localhost:3001/api/posts")
            .then((response) => {
                // Update posts to include the 'liked' status for the current user
                const updatedPosts = response.data.map((post) => ({
                    ...post,
                    liked: post.likedBy.some(
                        (like) => like.walletAddress === user.walletAddress
                    ),
                }));
                setPosts(updatedPosts);
            })
            .catch((error) => console.error("Error fetching posts:", error));
    }, [user.walletAddress]);

    // Handle the creation of a new post
    const handlePostSubmit = () => {
        if (!description) {
            console.error("Description is required");
            return;
        }

        const formData = new FormData();
        formData.append("user", user.walletAddress); // Pass walletAddress to the backend
        formData.append("type", postType);
        formData.append("description", description);
        if (media) formData.append("media", media); // Append media file if present

        axios
            .post("http://localhost:3001/api/posts", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then((response) => {
                setPosts([response.data, ...posts]); // Add the new post to the state
                setDescription(""); // Clear the description field
                setMedia(null); // Clear the media field
            })
            .catch((error) => console.error("Error creating post:", error));
    };

    const handlePostTypeChange = (event) => {
        setPostType(event.target.value);
    };

    const handleMediaChange = (event) => {
        setMedia(event.target.files[0]);
    };

    const handlePhotoVideoClick = () => {
        document.getElementById("icon-button-file").click();
    };

    const handleImageClick = (post) => {
        setSelectedPost(post);
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setSelectedPost(null);
    };

    const handleLikePopupClose = () => {
        setIsLikePopupOpen(false);
        setSelectedPost(null);
    };

    const handleLike = async (index) => {
        const updatedPosts = [...posts];
        const post = updatedPosts[index];

        // Optimistically update the UI
        post.liked = !post.liked;
        if (post.liked) {
            post.likedBy = [
                ...(post.likedBy || []),
                {
                    walletAddress: user.walletAddress,
                    username: userData.username,
                    avatar: userData.avatar,
                },
            ];
        } else {
            post.likedBy = post.likedBy.filter(
                (like) => like.walletAddress !== user.walletAddress
            );
        }

        setPosts(updatedPosts);

        try {
            await axios.put(
                `http://localhost:3001/api/posts/${post._id}/like`,
                {
                    userId: user.walletAddress,
                }
            );
        } catch (error) {
            console.error("Error liking the post:", error);
            // Revert UI changes if there was an error
            post.liked = !post.liked;
            setPosts(updatedPosts);
        }
    };

    const getLikeMessage = (post) => {
        const likedByUser = post.likedBy.some(
            (like) => like.walletAddress === user.walletAddress
        );

        if (likedByUser) {
            const otherLikes = post.likedBy.length - 1;
            if (otherLikes > 0) {
                return `You and ${otherLikes} others liked this post`;
            }
            return "You liked this post";
        } else {
            return `${post.likedBy.length} ${
                post.likedBy.length === 1 ? "user" : "users"
            } liked this post`;
        }
    };

    const handleLikeTextClick = (post) => {
        setSelectedPost(post);
        setIsLikePopupOpen(true);
    };

    return (
        <div className="font-sans bg-gray-900 min-h-screen">
            {/* Top Navbar */}
            <Sidebar />

            <div className="flex mt-5">
                {/* Left Sidebar */}
                <div className="w-1/4 bg-gray-900">
                    <LeftSideBar />
                </div>
                {/* Main Content */}
                <div className="w-1/2 bg-gray-900 px-36 overflow-y-auto">
                    <Stories /> {/* Add Stories component here */}
                    {/* Dynamic Post Creation Section */}
                    <div className="p-4 bg-gray-800 rounded-lg mb-5 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <img
                                    src={userData.avatar}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full"
                                />
                                <p className="ml-3 text-white">
                                    @{userData.username}
                                </p>
                            </div>
                            <select
                                value={postType}
                                onChange={handlePostTypeChange}
                                className="bg-gray-700 text-white rounded-full px-3 h-10">
                                <option
                                    value="Photo/Video"
                                    className="text-black">
                                    <PhotoIcon className="mr-2" /> Photo/Video
                                </option>
                                <option value="Airdrop" className="text-black">
                                    <RedeemIcon className="mr-2" /> Airdrop
                                </option>
                                <option value="Token" className="text-black">
                                    <SwapHorizIcon className="mr-2" /> Token
                                </option>
                                <option value="NFT" className="text-black">
                                    <EmojiEmotionsIcon className="mr-2" /> NFT
                                </option>
                                <option
                                    value="Token Swap"
                                    className="text-black">
                                    <SwapHorizIcon className="mr-2" /> Token
                                    Swap
                                </option>
                            </select>
                        </div>

                        <div className="flex items-center mt-3">
                            <input
                                type="text"
                                placeholder="What's on your mind?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-gray-700 text-white rounded-full py-2 px-4"
                            />
                        </div>

                        <hr className="my-3 border-gray-600" />

                        <div className="flex items-center">
                            <input
                                accept="image/*,video/*"
                                style={{ display: "none" }}
                                id="icon-button-file"
                                type="file"
                                onChange={handleMediaChange}
                            />
                            <label htmlFor="icon-button-file">
                                <div className="text-blue-500 cursor-pointer">
                                    <CloudUploadIcon />
                                </div>
                            </label>
                            <p
                                className="text-white cursor-pointer text-lg ml-3 flex-grow"
                                onClick={handlePhotoVideoClick}>
                                {media ? media.name : "Photo/Video"}
                            </p>
                            <button
                                className="bg-blue-500 text-white rounded-full px-5 py-2"
                                onClick={handlePostSubmit}>
                                Post
                            </button>
                        </div>
                    </div>
                    {/* Displaying All Posts */}
                    {posts.length > 0 ? (
                        posts.map((post, index) => (
                            <div
                                key={index}
                                className="bg-gray-800 rounded-lg shadow-lg mb-5 p-4">
                                <div className="flex items-center mb-4">
                                    <img
                                        src={
                                            post.user && post.user.avatar
                                                ? post.user.avatar
                                                : logo
                                        }
                                        alt="User"
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div className="ml-3">
                                        <Link
                                            to={`/profile/${post.user.walletAddress}`}>
                                            <p className="text-white font-bold cursor-pointer">
                                                {post.user && post.user.username
                                                    ? post.user.username
                                                    : "Unknown User"}
                                            </p>
                                        </Link>
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
                                <div className="mb-4">
                                    <p className="text-white text-justify mb-3">
                                        {post.description}
                                    </p>
                                    {Array.isArray(post.media) &&
                                        post.media.length > 0 && (
                                            <img
                                                src={`http://localhost:3001${post.media[0]}`}
                                                alt="Post image"
                                                className="w-full rounded-lg cursor-pointer"
                                                onClick={() =>
                                                    handleImageClick(post)
                                                }
                                            />
                                        )}
                                </div>
                                {/* Display liked users */}
                                {post.likedBy && post.likedBy.length > 0 && (
                                    <div
                                        className="text-white mb-2 cursor-pointer"
                                        onClick={() =>
                                            handleLikeTextClick(post)
                                        }>
                                        <p>{getLikeMessage(post)}</p>
                                    </div>
                                )}

                                <div className="flex justify-around">
                                    <button
                                        className={`flex items-center space-x-2 ${
                                            post.liked
                                                ? "text-blue-500"
                                                : "text-white"
                                        }`}
                                        onClick={() => handleLike(index)}>
                                        <ThumbUpIcon />
                                        <span>Like</span>
                                    </button>
                                    <button className="flex items-center space-x-2 text-white">
                                        <CommentIcon />
                                        <span>Comment</span>
                                    </button>
                                    <button className="flex items-center space-x-2 text-white">
                                        <ShareIcon />
                                        <span>Share</span>
                                    </button>
                                    <button className="flex items-center space-x-2 text-white">
                                        <AttachMoneyIcon />
                                        <span>Donate</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-white text-center">
                            No posts available
                        </p>
                    )}
                </div>
                {/* Rightbar */}
                <div className="w-1/4 bg-gray-900 pt-5 pr-5 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
                    <Rightbar />
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
                        <div className="flex items-center mt-4">
                            <textarea
                                className="w-full bg-gray-800 text-white rounded-lg p-3 mr-2"
                                placeholder="Add a comment..."
                                rows={1}
                            />
                            <button className="text-blue-500">
                                <SendIcon />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Liked Users Popup Dialog */}
            {isLikePopupOpen && selectedPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                    <div className="bg-gray-900 p-5 rounded-lg w-full max-w-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-white text-lg">
                                Users who liked this post
                            </p>
                            <button
                                className="text-white hover:text-gray-400"
                                onClick={handleLikePopupClose}>
                                Close
                            </button>
                        </div>
                        <div>
                            {selectedPost.likedBy &&
                            selectedPost.likedBy.length > 0 ? (
                                selectedPost.likedBy.map((like, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center mb-2">
                                        <img
                                            src={like.avatar || logo}
                                            alt={like.username || "Unknown"}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <p className="ml-3 text-white">
                                            @
                                            {like.username ||
                                                shortenAddress(
                                                    like.walletAddress
                                                )}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-white">
                                    No users liked this post yet.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
