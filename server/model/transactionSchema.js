const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["Airdrop", "Token Sale", "NFT Sale", "Token Swap"],
        required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    details: { type: mongoose.Schema.Types.Mixed }, // Store transaction details, can be an object
    createdAt: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", TransactionSchema);
module.exports = Transaction;
