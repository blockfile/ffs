import React, { useState, useContext, useEffect, useCallback } from "react";
import logo from "../assets/images/trendzlogo.png";
import makeBlockie from "ethereum-blockies-base64";
import Web3 from "web3";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { WalletContext } from "../navbar/WalletContext"; // Import the context
import { Link } from "react-router-dom";

const Sidebar = () => {
    const [account, setAccount] = useState(null);
    const [balance] = useState("200,000");
    const { connectWallet } = useContext(WalletContext); // Access the context

    const connectWalletHandler = useCallback(async () => {
        if (window.ethereum) {
            try {
                const web3 = new Web3(window.ethereum);
                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                });
                const walletAddress = accounts[0];

                if (account !== walletAddress) {
                    setAccount(walletAddress);
                    connectWallet(walletAddress); // Update context

                    // Send the wallet address to the backend to save or update the user
                    await fetch(
                        "http://localhost:3001/api/users/connect-wallet",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ walletAddress }),
                        }
                    );
                }
            } catch (error) {
                console.error("Connection to Metamask failed", error);
            }
        } else {
            alert("Please install Metamask!");
        }
    }, [account, connectWallet]);

    useEffect(() => {
        const checkWalletConnection = async () => {
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum);
                const accounts = await web3.eth.getAccounts();
                if (accounts.length > 0) {
                    const walletAddress = accounts[0];
                    if (account !== walletAddress) {
                        setAccount(walletAddress);
                        connectWallet(walletAddress); // Update context

                        // Optionally, send the wallet address to the backend to save or update the user
                        await fetch(
                            "http://localhost:3001/api/users/connect-wallet",
                            {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ walletAddress }),
                            }
                        );
                    }
                }
            }
        };

        checkWalletConnection();
    }, [account, connectWallet]);

    const shortenAddress = (address) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    return (
        <div
            className="h-[80px] w-full top-0 flex items-center px-8 text-white"
            style={{
                fontFamily: "Changa, sans-serif",
                backgroundColor: "#242526",
            }}>
            <Link to="/">
                <div className="flex items-center">
                    <img src={logo} className="h-16 w-16" alt="Trendz Logo" />
                    <p className="ml-4 text-xl">TRENDZ</p>
                </div>
            </Link>
            <div className="flex flex-1 justify-center space-x-8">
                <Link to="/">
                    <HomeIcon
                        className="hover:text-gray-400 cursor-pointer"
                        fontSize="medium"
                    />
                </Link>
                <SearchIcon
                    className="hover:text-gray-400 cursor-pointer"
                    fontSize="medium"
                />
                <StorefrontIcon
                    className="hover:text-gray-400 cursor-pointer"
                    fontSize="medium"
                />
                <NotificationsIcon
                    className="hover:text-gray-400 cursor-pointer"
                    fontSize="medium"
                />
                {account && (
                    <Link to={`/profile/${account}`}>
                        {/* Link to the user's profile using their wallet address */}
                        <AccountCircleIcon
                            className="hover:text-gray-400 cursor-pointer"
                            fontSize="medium"
                        />
                    </Link>
                )}
            </div>
            <div className="flex items-center space-x-8">
                {account ? (
                    <div className="flex items-center space-x-2">
                        <img
                            src={makeBlockie(account)}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full"
                        />
                        <div className="flex flex-col">
                            <span>{shortenAddress(account)}</span>
                            <span className="text-yellow-400 text-sm">
                                {balance} TRB
                            </span>
                        </div>
                    </div>
                ) : (
                    <button
                        className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-5 py-2"
                        onClick={connectWalletHandler}>
                        Connect Wallet
                    </button>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
