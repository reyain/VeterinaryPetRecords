
const express = require("express");
const { rateLimit } = require("express-rate-limit");
const db = require("../config/db");
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
   ADMIN-ONLY AUTHORIZATION
   ===================================================== */

function requireAdmin(req, res, next) {
    const role = String(
        req.session?.user?.role || ""
    ).trim().toLowerCase();

    if (!["admin", "administrator"].includes(role)) {
        return res.status(403).json({
            success: false,
            code: "FORBIDDEN",
            message: "Administrator access is required."
        });
    }

    next();
}

/* =====================================================
   STAFF-ONLY AUTHORIZATION
   ===================================================== */

function requireStaff(req, res, next) {
    const role = String(
        req.session?.user?.role || ""
    ).trim().toLowerCase();

    if (role !== "staff") {
        return res.status(403).json({
            success: false,
            code: "FORBIDDEN",
            message: "Staff access is required to modify veterinary records."
        });
    }

    next();
}


/* =====================================================
   HELPER TO FORWARD REQUESTS TO THE C# BRIDGE
   ===================================================== */
/* =====================================================
   LOGIN RATE LIMITING
   Maximum 10 unsuccessful attempts per IP in 15 minutes
   ===================================================== */

const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        code: "LOGIN_RATE_LIMITED",
        message: "Too many unsuccessful login attempts. Please try again in 15 minutes."
    }
});

async function proxyBridgeRequest(req, res, bridgePath, bodyOverride = undefined) {
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
            options.body = JSON.stringify(bodyOverride ?? req.body ?? {});
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
   SECURE RECORD WRITES

   New records use the logged-in user's ID.
   Updates preserve the original record's UserID.
   ===================================================== */

function setTrustedUserId(payload, userId) {
    for (const key of Object.keys(payload)) {
        if (key.toLowerCase() === "userid") {
            delete payload[key];
        }
    }

    payload.UserID = userId;
}

async function proxyRecordWrite(req, res, bridgePath) {
    const sessionUserId = Number(req.session?.user?.userId);

    if (!Number.isInteger(sessionUserId) || sessionUserId <= 0) {
        return res.status(401).json({
            success: false,
            code: "AUTH_REQUIRED",
            message: "A valid login session is required."
        });
    }

    const payload = { ...(req.body ?? {}) };

    // Never trust a browser-submitted UserID for new records.
    if (req.method === "POST") {
        setTrustedUserId(payload, sessionUserId);

        return proxyBridgeRequest(
            req,
            res,
            bridgePath,
            payload
        );
    }

    // For edits, retrieve the existing record from the Bridge
    // and preserve its original staff attribution.
    try {
        const currentResponse = await fetch(
            `${BRIDGE_URL}${bridgePath}`,
            {
                method: "GET",
                headers: { Accept: "application/json" },
                signal: AbortSignal.timeout(10000)
            }
        );

        const currentBody = await currentResponse
            .json()
            .catch(() => null);

        if (!currentResponse.ok) {
            return res.status(currentResponse.status).json(
                currentBody ?? {
                    success: false,
                    message: "Unable to retrieve the existing record."
                }
            );
        }

        if (!currentBody?.success || !currentBody?.data) {
            return res.status(502).json({
                success: false,
                message: "The Bridge returned an unexpected record response."
            });
        }

        const originalUserId = Number(
            currentBody.data.userID ??
            currentBody.data.UserID ??
            currentBody.data.userId
        );

        if (!Number.isInteger(originalUserId) || originalUserId <= 0) {
            return res.status(500).json({
                success: false,
                message: "The existing record has no valid staff attribution."
            });
        }

        // Ignore any UserID supplied by the browser during an edit.
        setTrustedUserId(payload, originalUserId);

        return proxyBridgeRequest(
            req,
            res,
            bridgePath,
            payload
        );
    } catch (error) {
        console.error("Secure record write failed:", error.message);

        return res.status(503).json({
            success: false,
            code: "BRIDGE_UNAVAILABLE",
            message: "Unable to verify the existing record with the C# Bridge."
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

router.post("/auth/login", loginRateLimiter, proxyLogin);
router.post("/login", loginRateLimiter, proxyLogin);
router.post("/auth/logout", logoutSession);

// Require a valid server-side login session for all
// API routes registered below this point.
router.use((req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            code: "AUTH_REQUIRED",
            message: "Please log in to access this resource."
        });
    }

    next();
});


/* =====================================================
   STAFF ACCOUNTS — ADMIN ONLY
   ===================================================== */

router.get(
    "/staff-accounts",
    requireAdmin,
    notImplemented("Staff account listing")
);

router.post(
    "/staff-accounts",
    requireAdmin,
    notImplemented("Staff account creation")
);

router.get(
    "/staff-accounts/:userId",
    requireAdmin,
    notImplemented("Staff account details")
);

router.put(
    "/staff-accounts/:userId",
    requireAdmin,
    notImplemented("Staff account update")
);

router.patch(
    "/staff-accounts/:userId/status",
    requireAdmin,
    notImplemented("Staff account status")
);

router.post(
    "/staff-accounts/:userId/reset-password",
    requireAdmin,
    notImplemented("Staff password reset")
);

router.get(
    "/online-users",
    requireAdmin,
    notImplemented("Online user monitoring")
);

router.post(
    "/online-users/:sessionId/disconnect",
    requireAdmin,
    notImplemented("User session disconnection")
);



/* =====================================================
   AUDIT LOGS — ADMINISTRATOR ONLY
   ===================================================== */

/* =====================================================
   AUDIT LOGS — ADMINISTRATOR ONLY
   ===================================================== */

const auditModulePatterns = {
    owners: "%owner%",
    pets: "%pet%",
    "medical records": "%medical%",
    vaccinations: "%vaccin%",
    "staff accounts": "%staff%",
    authentication: "%auth%"
};

router.get("/audit-logs/summary", requireAdmin, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT
                COUNT(*) AS total,
                COALESCE(SUM(DATE(created_at) = CURDATE()), 0) AS today,
                COALESCE(SUM(action = 'CREATE'), 0) AS creates,
                COALESCE(SUM(action = 'UPDATE'), 0) AS updates,
                COALESCE(SUM(action = 'DELETE'), 0) AS deletes
            FROM audit_logs
        `);

        const row = rows[0] || {};

        return res.json({
            success: true,
            data: {
                total: Number(row.total || 0),
                today: Number(row.today || 0),
                creates: Number(row.creates || 0),
                updates: Number(row.updates || 0),
                deletes: Number(row.deletes || 0)
            }
        });
    } catch (error) {
        console.error("Audit summary failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve the audit summary."
        });
    }
});

router.get("/audit-logs", requireAdmin, async (req, res) => {
    try {
        const page = Math.max(
            1,
            Number.parseInt(String(req.query.page ?? "1"), 10) || 1
        );

        const limit = Math.min(
            100,
            Math.max(
                1,
                Number.parseInt(String(req.query.limit ?? "25"), 10) || 25
            )
        );

        const search = String(req.query.search ?? "").trim().slice(0, 100);
        const action = String(req.query.action ?? "").trim().toUpperCase();
        const moduleKey = String(req.query.module ?? "").trim().toLowerCase();
        const role = String(req.query.role ?? "").trim().toLowerCase();
        const date = String(req.query.date ?? "").trim();

        const allowedActions = new Set([
            "LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE"
        ]);

        if (action && !allowedActions.has(action)) {
            return res.status(400).json({
                success: false,
                message: "Invalid audit action filter."
            });
        }

        if (moduleKey && moduleKey !== "all" && !auditModulePatterns[moduleKey]) {
            return res.status(400).json({
                success: false,
                message: "Invalid audit module filter."
            });
        }

        if (role && role !== "all" && !["admin", "staff"].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user role filter."
            });
        }

        if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                success: false,
                message: "Date must use YYYY-MM-DD format."
            });
        }

        const conditions = [];
        const params = [];

        if (search) {
            const pattern = `%${search}%`;

            conditions.push(`(
                CAST(al.audit_id AS CHAR) LIKE ?
                OR CAST(al.user_id AS CHAR) LIKE ?
                OR COALESCE(u.username, '') LIKE ?
                OR COALESCE(u.full_name, '') LIKE ?
                OR al.action LIKE ?
                OR al.module LIKE ?
                OR COALESCE(al.description, '') LIKE ?
                OR COALESCE(al.computer_name, '') LIKE ?
                OR COALESCE(al.client_ip, '') LIKE ?
            )`);

            params.push(
                pattern, pattern, pattern, pattern, pattern,
                pattern, pattern, pattern, pattern
            );
        }

        if (action) {
            conditions.push("al.action = ?");
            params.push(action);
        }

        if (moduleKey && moduleKey !== "all") {
            conditions.push("LOWER(al.module) LIKE ?");
            params.push(auditModulePatterns[moduleKey]);
        }

        if (role && role !== "all") {
            conditions.push("LOWER(COALESCE(u.role, '')) = ?");
            params.push(role);
        }

        if (date) {
            conditions.push("DATE(al.created_at) = ?");
            params.push(date);
        }

        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        const [countRows] = await db.execute(
            `SELECT COUNT(*) AS total
             FROM audit_logs al
             LEFT JOIN users u ON u.user_id = al.user_id
             ${whereClause}`,
            params
        );

        const total = Number(countRows[0]?.total ?? 0);
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;

        const [rows] = await db.execute(
            `SELECT
                al.audit_id AS auditID,
                al.user_id AS userID,
                u.username AS username,
                u.full_name AS fullName,
                u.role AS role,
                al.action AS action,
                al.module AS module,
                al.record_id AS recordID,
                al.description AS description,
                al.client_type AS clientType,
                al.computer_name AS computerName,
                al.client_ip AS clientIP,
                al.created_at AS createdAt
             FROM audit_logs al
             LEFT JOIN users u ON u.user_id = al.user_id
             ${whereClause}
             ORDER BY al.created_at DESC, al.audit_id DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        return res.json({
            success: true,
            data: rows,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error("Audit log listing failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve audit logs."
        });
    }
});

router.get("/audit-logs/:logId", requireAdmin, async (req, res) => {
    try {
        const logId = Number(req.params.logId);

        if (!Number.isSafeInteger(logId) || logId <= 0) {
            return res.status(400).json({
                success: false,
                message: "A valid audit log ID is required."
            });
        }

        const [rows] = await db.execute(
            `SELECT
                al.audit_id AS auditID,
                al.user_id AS userID,
                u.username AS username,
                u.full_name AS fullName,
                u.role AS role,
                al.action AS action,
                al.module AS module,
                al.record_id AS recordID,
                al.description AS description,
                al.old_values AS oldValues,
                al.new_values AS newValues,
                al.client_type AS clientType,
                al.computer_name AS computerName,
                al.client_ip AS clientIP,
                al.created_at AS createdAt
             FROM audit_logs al
             LEFT JOIN users u ON u.user_id = al.user_id
             WHERE al.audit_id = ?
             LIMIT 1`,
            [logId]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Audit log entry was not found."
            });
        }

        return res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        console.error("Audit log details failed:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve audit log details."
        });
    }
});



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

router.get("/medical-records/:recordId", (req, res) =>
    proxyBridgeRequest(
        req,
        res,
        `/api/medical-records/${encodeURIComponent(req.params.recordId)}`
    )
);

router.post("/medical-records", requireStaff, (req, res) =>
    proxyRecordWrite(req, res, "/api/medical-records")
);

router.put("/medical-records/:recordId", requireStaff, (req, res) =>
    proxyRecordWrite(
        req,
        res,
        `/api/medical-records/${encodeURIComponent(req.params.recordId)}`
    )
);



router.delete("/medical-records/:recordId", requireStaff, (req, res) =>
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

router.post("/vaccinations", requireStaff, (req, res) =>
    proxyRecordWrite(req, res, "/api/vaccinations")
);

router.get("/vaccinations/:vaccinationId", (req, res) =>
    proxyBridgeRequest(
        req,
        res,
        `/api/vaccinations/${encodeURIComponent(req.params.vaccinationId)}`
    )
);

router.put("/vaccinations/:vaccinationId", requireStaff, (req, res) =>
    proxyRecordWrite(
        req,
        res,
        `/api/vaccinations/${encodeURIComponent(req.params.vaccinationId)}`
    )
);

router.delete("/vaccinations/:vaccinationId", requireStaff, (req, res) =>
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





async function proxyLogin(req, res) {
    try {
        const response = await fetch(`${BRIDGE_URL}/api/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(req.body ?? {})
        });

        const data = await response.json().catch(() => null);

        if (
            !response.ok ||
            !data ||
            data.success !== true ||
            !data.data
        ) {
            return res.status(response.status || 401).json(
                data || {
                    success: false,
                    message: "Invalid login response."
                }
            );
        }

        const userId = Number(data.data.userId);
        const username = String(data.data.username || "");
        const fullName = String(data.data.fullName || "");
        const role = String(data.data.role || "").trim();

        if (
            !Number.isInteger(userId) ||
            userId <= 0 ||
            !username ||
            !["admin", "administrator", "staff", "front desk", "veterinarian"]
                .includes(role.toLowerCase())
        ) {
            return res.status(403).json({
                success: false,
                message: "This account is not authorized to access the system."
            });
        }

        // Regenerate the session after successful authentication.
        await new Promise((resolve, reject) => {
            req.session.regenerate(error => {
                if (error) reject(error);
                else resolve();
            });
        });

        req.session.user = {
            userId,
            username,
            fullName,
            role
        };

        // Ensure the session is stored before reporting login success.
        await new Promise((resolve, reject) => {
            req.session.save(error => {
                if (error) reject(error);
                else resolve();
            });
        });

        // Keep the existing response format for frontend compatibility.
        return res.status(200).json(data);

    } catch (error) {
        console.error("Login/session error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to complete login or save the server session."
        });
    }
}

function logoutSession(req, res) {
    if (!req.session) {
        res.clearCookie("vetpet.sid", { path: "/" });

        return res.json({
            success: true,
            message: "Logged out successfully."
        });
    }

    req.session.destroy(error => {
        res.clearCookie("vetpet.sid", { path: "/" });

        if (error) {
            console.error("Logout/session error:", error);

            return res.status(500).json({
                success: false,
                message: "Unable to terminate the server session."
            });
        }

        return res.json({
            success: true,
            message: "Logged out successfully."
        });
    });
}



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
