
const express = require("express");

const router = express.Router();

/* =====================================================
   C# BRIDGE CONFIGURATION
   ===================================================== */

const BRIDGE_URL =
    process.env.BRIDGE_URL || "http://127.0.0.1:5001";


/* =====================================================
   HELPER FOR FEATURES NOT IMPLEMENTED YET
   ===================================================== */

function notImplemented(feature) {
    return (req, res) => {
        res.status(501).json({
            success: false,
            code: "NOT_IMPLEMENTED",
            feature,
            message: `${feature} API has not been implemented yet.`
        });
    };
}


/* =====================================================
   HELPER TO FORWARD REQUESTS TO THE C# BRIDGE
   ===================================================== */

async function proxyBridgeRequest(req, res, bridgePath) {
    try {
        const options = {
            method: req.method,
            headers: {
                Accept: "application/json"
            },
            signal: AbortSignal.timeout(10000)
        };

        if (["POST", "PUT", "PATCH"].includes(req.method)) {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(req.body ?? {});
        }

        const bridgeResponse = await fetch(
            `${BRIDGE_URL}${bridgePath}`,
            options
        );

        const responseBody = await bridgeResponse.text();
        const contentType = bridgeResponse.headers.get("content-type");

        if (contentType) {
            res.setHeader("Content-Type", contentType);
        }

        return res.status(bridgeResponse.status).send(responseBody);
    } catch (error) {
        console.error("C# Bridge request failed:", error.message);

        return res.status(503).json({
            success: false,
            code: "BRIDGE_UNAVAILABLE",
            message: "Unable to contact the C# Bridge.",
            detail: error.message
        });
    }
}


/* =====================================================
   SYSTEM HEALTH
   GET /api/health
   ===================================================== */

router.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        service: "Veterinary Pet Records System",
        status: "running",
        timestamp: new Date().toISOString()
    });
});


/* =====================================================
   AUTHENTICATION
   POST /api/auth/login
   POST /api/login (compatibility route)
   ===================================================== */

router.post("/auth/login", (req, res) => {
    return proxyBridgeRequest(req, res, "/api/login");
});

router.post("/login", (req, res) => {
    return proxyBridgeRequest(req, res, "/api/login");
});

router.post("/auth/logout", notImplemented("Authentication logout"));


/* =====================================================
   STAFF ACCOUNTS
   ===================================================== */

router.get("/staff-accounts", notImplemented("Staff account listing"));
router.post("/staff-accounts", notImplemented("Staff account creation"));
router.get("/staff-accounts/:userId", notImplemented("Staff account details"));
router.put("/staff-accounts/:userId", notImplemented("Staff account update"));
router.patch("/staff-accounts/:userId/status", notImplemented("Staff account status"));
router.post("/staff-accounts/:userId/reset-password", notImplemented("Staff password reset"));


/* =====================================================
   OWNERS
   ===================================================== */

router.get("/owners", (req, res) =>
    proxyBridgeRequest(req, res, "/api/owners")
);

router.post("/owners", (req, res) =>
    proxyBridgeRequest(req, res, "/api/owners")
);

router.get("/owners/:ownerId", (req, res) =>
    proxyBridgeRequest(
        req,
        res,
        `/api/owners/${encodeURIComponent(req.params.ownerId)}`
    )
);

router.put("/owners/:ownerId", (req, res) =>
    proxyBridgeRequest(
        req,
        res,
        `/api/owners/${encodeURIComponent(req.params.ownerId)}`
    )
);

router.delete("/owners/:ownerId", (req, res) =>
    proxyBridgeRequest(
        req,
        res,
        `/api/owners/${encodeURIComponent(req.params.ownerId)}`
    )
);


/* =====================================================
   PETS
   ===================================================== */

router.get("/pets", (req, res) =>
    proxyBridgeRequest(req, res, "/api/pets")
);

router.get("/pets/:petId", (req, res) =>
    proxyBridgeRequest(
        req,
        res,
        `/api/pets/${encodeURIComponent(req.params.petId)}`
    )
);

router.post("/pets", (req, res) =>
    proxyBridgeRequest(req, res, "/api/pets")
);

router.put("/pets/:petId", (req, res) =>
    proxyBridgeRequest(
        req,
        res,
        `/api/pets/${encodeURIComponent(req.params.petId)}`
    )
);

router.delete("/pets/:petId", (req, res) =>
    proxyBridgeRequest(
        req,
        res,
        `/api/pets/${encodeURIComponent(req.params.petId)}`
    )
);


/* =====================================================
   MEDICAL RECORDS
   ===================================================== */

router.get("/medical-records", (req, res) =>
    proxyBridgeRequest(req, res, "/api/medical-records")
);

router.post("/medical-records", (req, res) =>
    proxyBridgeRequest(req, res, "/api/medical-records")
);

router.get("/medical-records/:recordId", (req, res) =>
    proxyBridgeRequest(
        req,
        res,
        `/api/medical-records/${encodeURIComponent(req.params.recordId)}`
    )
);

router.put("/medical-records/:recordId", (req, res) =>
    proxyBridgeRequest(
        req,
        res,
        `/api/medical-records/${encodeURIComponent(req.params.recordId)}`
    )
);

router.delete("/medical-records/:recordId", (req, res) =>
    proxyBridgeRequest(
        req,
        res,
        `/api/medical-records/${encodeURIComponent(req.params.recordId)}`
    )
);


/* =====================================================
   VACCINATIONS
   ===================================================== */

router.get("/vaccinations", (req, res) =>
    proxyBridgeRequest(req, res, "/api/vaccinations")
);

router.post("/vaccinations", (req, res) =>
    proxyBridgeRequest(req, res, "/api/vaccinations")
);

router.get("/vaccinations/:vaccinationId", (req, res) =>
    proxyBridgeRequest(
        req,
        res,
        `/api/vaccinations/${encodeURIComponent(req.params.vaccinationId)}`
    )
);

router.put("/vaccinations/:vaccinationId", (req, res) =>
    proxyBridgeRequest(
        req,
        res,
        `/api/vaccinations/${encodeURIComponent(req.params.vaccinationId)}`
    )
);

router.delete("/vaccinations/:vaccinationId", (req, res) =>
    proxyBridgeRequest(
        req,
        res,
        `/api/vaccinations/${encodeURIComponent(req.params.vaccinationId)}`
    )
);

router.get("/pets/:petId/vaccinations", (req, res) =>
    proxyBridgeRequest(
        req,
        res,
        `/api/pets/${encodeURIComponent(req.params.petId)}/vaccinations`
    )
);


/* =====================================================
   USER LOOKUP
   These routes require matching endpoints in the Bridge.
   ===================================================== */

router.get("/users/by-username/:username", (req, res) =>
    proxyBridgeRequest(
        req,
        res,
        `/api/users/by-username/${encodeURIComponent(req.params.username)}`
    )
);

router.get("/users/by-id/:userID", (req, res) =>
    proxyBridgeRequest(
        req,
        res,
        `/api/users/by-id/${encodeURIComponent(req.params.userID)}`
    )
);


/* =====================================================
   ONLINE USERS
   ===================================================== */

router.get("/online-users", notImplemented("Online user monitoring"));

router.post(
    "/online-users/:sessionId/disconnect",
    notImplemented("User session disconnection")
);


/* =====================================================
   AUDIT LOGS
   ===================================================== */

router.get("/audit-logs", notImplemented("Audit log listing"));
router.get("/audit-logs/:logId", notImplemented("Audit log details"));


/* =====================================================
   REPORTS
   ===================================================== */

router.get("/reports/summary", notImplemented("Report summary"));
router.get("/reports/:reportType", notImplemented("Report generation"));


/* =====================================================
   SERVER CONFIGURATION
   ===================================================== */

router.get(
    "/server-configuration",
    notImplemented("Server configuration retrieval")
);

router.put(
    "/server-configuration",
    notImplemented("Server configuration update")
);


async function proxyLogin(req, res) {
    try {
        const response = await fetch(`${BRIDGE_URL}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error("Login proxy error:", error);

        return res.status(502).json({
            success: false,
            message: "Unable to connect to the login service."
        });
    }
}

router.post("/login", proxyLogin);
router.post("/auth/login", proxyLogin);



/* =====================================================
   UNKNOWN API ROUTE
   MUST REMAIN LAST
   ===================================================== */

router.use((req, res) => {
    res.status(404).json({
        success: false,
        code: "API_ROUTE_NOT_FOUND",
        message: "The requested API endpoint does not exist."
    });
});


module.exports = router;
