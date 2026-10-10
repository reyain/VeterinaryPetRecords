
const express = require("express");

const router = express.Router();

const BRIDGE_URL = "http://127.0.0.1:5001";

// Test communication between Node.js and the C# Bridge.
router.get("/bridge/health", async (req, res) => {
    try {
        const response = await fetch(`${BRIDGE_URL}/health`);

        if (!response.ok) {
            return res.status(502).json({
                success: false,
                message: "The C# Bridge returned an error."
            });
        }

        const bridgeData = await response.json();

        return res.status(200).json({
            success: true,
            message: "Node.js successfully contacted the C# Bridge.",
            bridge: bridgeData
        });

    } catch (error) {
        console.error("Bridge connection error:", error.message);

        return res.status(503).json({
            success: false,
            message: "Unable to connect to the C# Bridge."
        });
    }
});

module.exports = router;