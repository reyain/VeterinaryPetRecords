
const express = require("express");
const path = require("path");

const bridgeRoutes = require("./routes/bridge.routes");
const apiRoutes = require("./routes/api.routes");
const db = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;


/* =====================================================
   MIDDLEWARE
   ===================================================== */

app.use(express.json());


/* =====================================================
   BRIDGE ROUTES
   Register before the API catch-all router.
   ===================================================== */

app.use("/api", bridgeRoutes);


/* =====================================================
   DATABASE TEST
   Keep this before apiRoutes because apiRoutes has
   a catch-all handler for unknown API endpoints.
   ===================================================== */

app.get("/api/test-db", async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT
                1 AS connected,
                DATABASE() AS databaseName
        `);

        return res.json({
            success: true,
            message: "MySQL database connection successful.",
            database: result[0].databaseName
        });

    } catch (error) {
        console.error("Database connection error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to connect to the MySQL database."
        });
    }
});


/* =====================================================
   GENERAL API ROUTES
   Keep this after specific routes because its router
   includes an unknown-route handler.
   ===================================================== */

app.use("/api", apiRoutes);


/* =====================================================
   SERVE FRONTEND
   ===================================================== */

app.use(
    express.static(
        path.join(__dirname, "../frontend")
    )
);


/* =====================================================
   HOME PAGE
   ===================================================== */

app.get("/", (req, res) => {
    res.sendFile(
        path.join(__dirname, "../frontend/index.html")
    );
});


/* =====================================================
   START SERVER
   ===================================================== */

app.listen(PORT, () => {
    console.log(
        `Veterinary Pet Records System running at http://localhost:${PORT}`
    );

    console.log(
        `Bridge health test: http://localhost:${PORT}/api/bridge/health`
    );

    console.log(
        `Database test: http://localhost:${PORT}/api/test-db`
    );
});