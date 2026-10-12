
const path = require("path");

// Load the project-root .env before loading database or route modules.
require("dotenv").config({
    path: path.resolve(__dirname, "../.env")
});

const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const bridgeRoutes = require("./routes/bridge.routes");
const apiRoutes = require("./routes/api.routes");
const db = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3000;

const SESSION_DURATION = 8 * 60 * 60 * 1000;

if (!process.env.SESSION_SECRET) {
    console.error(
        "SESSION_SECRET is missing from the project-root .env file."
    );
    process.exit(1);
}

/* =====================================================
   MYSQL SESSION STORE
   ===================================================== */

const sessionStore = new MySQLStore(
    {
        clearExpired: true,
        checkExpirationInterval: 15 * 60 * 1000,
        expiration: SESSION_DURATION
    },
    db
);

sessionStore.onReady()
    .then(() => {
        console.log("MySQL session store ready.");
    })
    .catch(error => {
        console.error(
            "MySQL session store initialization failed:",
            error.message
        );
    });

/* =====================================================
   MIDDLEWARE
   ===================================================== */

app.use(express.json());

app.use(session({
    name: "vetpet.sid",
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // Local HTTP development only
        maxAge: SESSION_DURATION,
        path: "/"
    }
}));

/* =====================================================
   C# BRIDGE ROUTES
   ===================================================== */

app.use("/api", bridgeRoutes);

/* =====================================================
   DATABASE TEST
   ===================================================== */

app.get("/api/test-db", async (req, res) => {
    try {
        const [result] = await db.query(`
            SELECT 1 AS connected, DATABASE() AS databaseName
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
   ===================================================== */

app.use("/api", apiRoutes);

/* =====================================================
   FRONTEND STATIC FILES
   Page protection will be added in a later step.
   ===================================================== */

/* =====================================================
   PROTECT STAFF AND ADMIN HTML PAGES
   ===================================================== */

app.use((req, res, next) => {
    const requestedPath = req.path.toLowerCase();

    const isClientPage =
        requestedPath.startsWith("/client/pages/") &&
        requestedPath.endsWith(".html");

    const isServerPage =
        requestedPath.startsWith("/server/pages/") &&
        requestedPath.endsWith(".html");

    // Leave login and other public files accessible.
    if (!isClientPage && !isServerPage) {
        return next();
    }

    // Prevent protected pages from being kept in the browser cache.
    res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, private"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const currentUser = req.session?.user;

    // No valid server-side session: return to login.
    if (!currentUser) {
        return res.redirect("/index.html");
    }

    const role = String(currentUser.role || "")
        .trim()
        .toLowerCase();

    const adminRoles = ["admin", "administrator"];
    const staffRoles = [
        "staff",
        "front desk",
        "veterinarian"
    ];

    if (isClientPage && !staffRoles.includes(role)) {
        return res.redirect(
            adminRoles.includes(role)
                ? "/server/pages/dashboard.html"
                : "/index.html"
        );
    }

    if (isServerPage && !adminRoles.includes(role)) {
        return res.redirect(
            staffRoles.includes(role)
                ? "/client/pages/dashboard.html"
                : "/index.html"
        );
    }

    next();
});

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
