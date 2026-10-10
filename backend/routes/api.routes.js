
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
            message:
                `${feature} API has not been implemented yet.`
        });
    };
}


/* =====================================================
   HELPER TO FORWARD OWNER REQUESTS TO THE C# BRIDGE
   ===================================================== */

async function proxyOwnerRequest(req, res, bridgePath) {
    try {
        const options = {
            method: req.method,
            headers: {
                Accept: "application/json"
            },
            signal: AbortSignal.timeout(10000)
        };

        // Forward request bodies for create and update operations.
        if (["POST", "PUT", "PATCH"].includes(req.method)) {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(req.body ?? {});
        }

        const bridgeResponse = await fetch(
            `${BRIDGE_URL}${bridgePath}`,
            options
        );

        const responseBody = await bridgeResponse.text();
        const contentType =
            bridgeResponse.headers.get("content-type");

        if (contentType) {
            res.setHeader("Content-Type", contentType);
        }

        return res
            .status(bridgeResponse.status)
            .send(responseBody);

    } catch (error) {
        console.error(
            "C# Bridge request failed:",
            error.message
        );

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
   ===================================================== */

router.post(
    "/auth/login",
    notImplemented("Authentication")
);

router.post(
    "/auth/logout",
    notImplemented("Authentication")
);


/* =====================================================
   STAFF ACCOUNTS
   The Administrator manages staff accounts.
   ===================================================== */

router.get(
    "/staff-accounts",
    notImplemented("Staff account listing")
);

router.post(
    "/staff-accounts",
    notImplemented("Staff account creation")
);

router.get(
    "/staff-accounts/:userId",
    notImplemented("Staff account details")
);

router.put(
    "/staff-accounts/:userId",
    notImplemented("Staff account update")
);

router.patch(
    "/staff-accounts/:userId/status",
    notImplemented("Staff account status")
);

router.post(
    "/staff-accounts/:userId/reset-password",
    notImplemented("Staff password reset")
);


/* =====================================================
   OWNERS
   Requests are forwarded to the C# Bridge.
   ===================================================== */

// GET /api/owners
// Retrieve all owners.
router.get("/owners", (req, res) => {
    return proxyOwnerRequest(
        req,
        res,
        "/api/owners"
    );
});

// POST /api/owners
// Create an owner.
router.post("/owners", (req, res) => {
    return proxyOwnerRequest(
        req,
        res,
        "/api/owners"
    );
});

// GET /api/owners/:ownerId
// Retrieve one owner.
router.get("/owners/:ownerId", (req, res) => {
    return proxyOwnerRequest(
        req,
        res,
        `/api/owners/${encodeURIComponent(req.params.ownerId)}`
    );
});

// PUT /api/owners/:ownerId
// Update an owner.
router.put("/owners/:ownerId", (req, res) => {
    return proxyOwnerRequest(
        req,
        res,
        `/api/owners/${encodeURIComponent(req.params.ownerId)}`
    );
});

// DELETE /api/owners/:ownerId
// Delete an owner.
router.delete("/owners/:ownerId", (req, res) => {
    return proxyOwnerRequest(
        req,
        res,
        `/api/owners/${encodeURIComponent(req.params.ownerId)}`
    );
});


/* =====================================================
   PETS
   ===================================================== */

router.get("/pets", (req, res) => {
    return proxyOwnerRequest(
        req,
        res,
        "/api/pets"
    );
});

router.get("/pets/:petId", (req, res) => {
    return proxyOwnerRequest(
        req,
        res,
        `/api/pets/${req.params.petId}`
    );
});

// =========================
// PETS API - CREATE
// =========================

router.post("/pets", (req, res) => {
    return proxyOwnerRequest(
        req,
        res,
        "/api/pets"
    );
});

// =========================
// PETS API - UPDATE
// =========================

router.put("/pets/:petId", (req, res) => {
    return proxyOwnerRequest(
        req,
        res,
        `/api/pets/${encodeURIComponent(req.params.petId)}`
    );
});

// =========================
// PETS API - DELETE
// =========================

router.delete("/pets/:petId", (req, res) => {
    return proxyOwnerRequest(
        req,
        res,
        `/api/pets/${encodeURIComponent(req.params.petId)}`
    );
});




/* =====================================================
   MEDICAL RECORDS
   ===================================================== */

router.get(
    "/medical-records",
    notImplemented("Medical record listing")
);

router.post(
    "/medical-records",
    notImplemented("Medical record creation")
);

router.get(
    "/medical-records/:recordId",
    notImplemented("Medical record details")
);

router.put(
    "/medical-records/:recordId",
    notImplemented("Medical record update")
);

router.delete(
    "/medical-records/:recordId",
    notImplemented("Medical record deletion")
);

/* =====================================================
   VACCINATIONS
   ===================================================== */

// GET /api/vaccinations
// Retrieve all vaccination records.
router.get("/vaccinations", (req, res) => {
    return proxyOwnerRequest(
        req,
        res,
        "/api/vaccinations"
    );
});

// POST /api/vaccinations
// Create a vaccination record.
router.post("/vaccinations", (req, res) => {
    return proxyOwnerRequest(
        req,
        res,
        "/api/vaccinations"
    );
});

// GET /api/vaccinations/:vaccinationId
// Retrieve one vaccination record.
router.get("/vaccinations/:vaccinationId", (req, res) => {
    return proxyOwnerRequest(
        req,
        res,
        `/api/vaccinations/${encodeURIComponent(req.params.vaccinationId)}`
    );
});

// PUT /api/vaccinations/:vaccinationId
// Update a vaccination record.
router.put("/vaccinations/:vaccinationId", (req, res) => {
    return proxyOwnerRequest(
        req,
        res,
        `/api/vaccinations/${encodeURIComponent(req.params.vaccinationId)}`
    );
});

// DELETE /api/vaccinations/:vaccinationId
// Delete a vaccination record.
router.delete("/vaccinations/:vaccinationId", (req, res) => {
    return proxyOwnerRequest(
        req,
        res,
        `/api/vaccinations/${encodeURIComponent(req.params.vaccinationId)}`
    );
});

// GET /api/pets/:petId/vaccinations
// Retrieve the vaccination history for one pet.
router.get("/pets/:petId/vaccinations", (req, res) => {
    return proxyOwnerRequest(
        req,
        res,
        `/api/pets/${encodeURIComponent(req.params.petId)}/vaccinations`
    );
});

// Look up a staff account by username.
router.get("/users/by-username/:username", (req, res) => {
    return proxyOwnerRequest(
        req,
        res,
        `/api/users/by-username/${encodeURIComponent(req.params.username)}`
    );
});


 // Look up a staff account by numeric UserID.
router.get("/users/by-id/:userID", (req, res) => {
    return proxyOwnerRequest(
        req,
        res,
        `/api/users/by-id/${encodeURIComponent(req.params.userID)}`
    );
});



/* =====================================================
   ONLINE USERS
   Read-only monitoring and session control.
   ===================================================== */

router.get(
    "/online-users",
    notImplemented("Online user monitoring")
);

router.post(
    "/online-users/:sessionId/disconnect",
    notImplemented("User session disconnection")
);


/* =====================================================
   AUDIT LOGS
   Read-only for the Administrator.
   No edit or delete routes are provided.
   ===================================================== */

router.get(
    "/audit-logs",
    notImplemented("Audit log listing")
);

router.get(
    "/audit-logs/:logId",
    notImplemented("Audit log details")
);


/* =====================================================
   REPORTS
   ===================================================== */

router.get(
    "/reports/summary",
    notImplemented("Report summary")
);

router.get(
    "/reports/:reportType",
    notImplemented("Report generation")
);


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


/* =====================================================
   UNKNOWN API ROUTE
   Keep this handler last.
   ===================================================== */

router.use((req, res) => {
    res.status(404).json({
        success: false,
        code: "API_ROUTE_NOT_FOUND",
        message: "The requested API endpoint does not exist."
    });
});


module.exports = router;