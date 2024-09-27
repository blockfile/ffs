import React, { createContext, useState, useEffect } from "react";
import { getAddress } from "ethers"; // Correct import for getAddress function
import axios from "axios";

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const [walletConnected, setWalletConnected] = useState(false);
    const [user, setUser] = useState({
        _id: "",
        walletAddress: "",
        username: "",
        age: "",
        location: "",
        gender: "", // "male" or "female"
        popularityLevel: 1,
        following: 0,
        followers: 0,
    });

    // Function to connect wallet
    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                });
                const account = getAddress(accounts[0]); // Using getAddress to normalize address

                // Fetch user details from backend using walletAddress
                const response = await axios.post(
                    "http://localhost:3001/api/users/connect-wallet",
                    { walletAddress: account }
                );

                if (response.data && response.data.user) {
                    const userData = response.data.user;
                    // Update the user state with full user object from backend
                    setUser({
                        _id: userData._id,
                        walletAddress: userData.walletAddress,
                        username: userData.username || account, // Default to wallet address if no username
                        age: userData.age || "",
                        location: userData.location || "",
                        gender: userData.gender || "",
                        popularityLevel: userData.popularityLevel || 1,
                        following: userData.following.length || 0,
                        followers: userData.followers.length || 0,
                    });
                }

                setWalletConnected(true);
            } catch (error) {
                console.error("Error connecting wallet:", error);
            }
        } else {
            alert("Please install MetaMask!");
        }
    };

    // Function to update user profile
    const updateUserProfile = (updatedUser) => {
        setUser((prevUser) => ({
            ...prevUser,
            ...updatedUser,
        }));
    };

    // Auto-connect wallet if already connected
    useEffect(() => {
        if (window.ethereum && window.ethereum.selectedAddress) {
            connectWallet();
        }
    }, []);

    return (
        <WalletContext.Provider
            value={{
                walletConnected,
                user,
                connectWallet,
                updateUserProfile,
            }}>
            {children}
        </WalletContext.Provider>
    );
};
