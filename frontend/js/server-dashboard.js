/* =========================================================
   SERVER / ADMIN DASHBOARD
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const userName = document.getElementById("userName");
    const userRole = document.getElementById("userRole");
    const userAvatar = document.getElementById("userAvatar");
    const welcomeMessage = document.getElementById("welcomeMessage");
    const logoutButton = document.getElementById("logoutButton");

    /*
     * Temporary session check.
     * Real authentication will later come from
     * Node.js + C# Bridge + MySQL.
     */

    const currentUser = JSON.parse(
        sessionStorage.getItem("vetCurrentUser")
    );


    /* =====================================================
       ADMIN ACCESS CHECK
       ===================================================== */

    const normalizedRole = String(
    currentUser?.role || ""
    ).trim().toLowerCase();

    if (
        !currentUser ||
        !["admin", "administrator"].includes(normalizedRole)
    ) {
        window.location.replace("/index.html");
        return;
    }


    /* =====================================================
       DISPLAY USER
       ===================================================== */

    const name =
        currentUser.fullName ||
        currentUser.username ||
        "Administrator";


    userName.textContent = name;

    userRole.textContent = "Administrator";

    userAvatar.textContent =
        name.charAt(0).toUpperCase();

    welcomeMessage.textContent =
        `Welcome, ${name}`;
/* =====================================================
   LIVE DASHBOARD DATA
   ===================================================== */

const staffCount = document.getElementById("staffAccountCount");
const onlineCount = document.getElementById("onlineUserCount");
const petCount = document.getElementById("petCount");
const auditCount = document.getElementById("auditLogCount");
const webStatus = document.getElementById("webServerStatus");
const dbStatus = document.getElementById("databaseStatus");

// These APIs are not implemented yet.
staffCount.textContent = "N/A";
onlineCount.textContent = "N/A";


staffCount.title = "Staff account API is not implemented yet.";
onlineCount.title = "Online user monitoring API is not implemented yet.";


// Show loading states while checking the live services.
petCount.textContent = "Loading...";
webStatus.textContent = "Checking...";
dbStatus.textContent = "Checking...";

async function fetchDashboardData(url) {
    const response = await fetch(url, {
        method: "GET",
        credentials: "same-origin",
        headers: {
            Accept: "application/json"
        },
        cache: "no-store"
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(
            result?.message || `Request failed: HTTP ${response.status}`
        );
    }

    return result;
}

// Check the Node.js application.
fetchDashboardData("/api/health")
    .then(result => {
        webStatus.textContent =
            result.success && result.status === "running"
                ? "Running"
                : "Unavailable";
    })
    .catch(error => {
        console.error("Unable to check web server:", error);
        webStatus.textContent = "Unavailable";
    });

// Check the actual MySQL connection.
fetchDashboardData("/api/test-db")
    .then(result => {
        dbStatus.textContent =
            result.success === true
                ? "Connected"
                : "Not Connected";
    })
    .catch(error => {
        console.error("Unable to check database:", error);
        dbStatus.textContent = "Not Connected";
    });

// Load the actual registered-pet count.
fetchDashboardData("/api/pets")
    .then(result => {
        if (!result.success || !Array.isArray(result.data)) {
            throw new Error("Unexpected pets API response.");
        }

        petCount.textContent = String(result.data.length);
    })
    .catch(error => {
        console.error("Unable to load pet count:", error);
        petCount.textContent = "Unavailable";
    });

    
/* =====================================================
   LIVE AUDIT SUMMARY
   ===================================================== */

async function loadAuditSummary() {
    try {
        const result = await fetchDashboardData(
            "/api/audit-logs/summary"
        );

        if (!result.success || !result.data) {
            throw new Error("Unexpected audit summary response.");
        }

        auditCount.textContent = String(
            Number(result.data.total ?? 0)
        );

        auditCount.title = "Total audit entries recorded in the database.";
    } catch (error) {
        console.error("Unable to load audit summary:", error);

        auditCount.textContent = "Unavailable";
        auditCount.title = "Audit summary could not be loaded.";
    }
}

/* =====================================================
   RECENT SYSTEM ACTIVITY
   ===================================================== */

const recentActivityList = document.getElementById(
    "recentActivityList"
);

function formatActivityTimestamp(value) {
    if (!value) return "Time unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

function createActivityElement(log) {
    const item = document.createElement("div");
    item.className = "server-activity-item";

    const icon = document.createElement("div");
    icon.className = "server-activity-icon";

    const action = String(log.action || "").toUpperCase();

    const actionSymbols = {
        LOGIN: "IN",
        LOGOUT: "OUT",
        CREATE: "+",
        UPDATE: "~",
        DELETE: "X"
    };

    icon.textContent = actionSymbols[action] || "i";
    icon.setAttribute("aria-hidden", "true");

    const textContainer = document.createElement("div");
    textContainer.className = "server-activity-text";

    const heading = document.createElement("strong");
    const userName =
        log.fullName ||
        log.username ||
        `User ${log.userID ?? ""}`;

    heading.textContent = `${userName} · ${action || "ACTIVITY"}`;

    const details = document.createElement("span");
    const description =
        log.description ||
        `${log.module || "System"} activity recorded.`;

    details.textContent =
        `${description} · ${formatActivityTimestamp(log.createdAt)}`;

    textContainer.append(heading, details);
    item.append(icon, textContainer);

    return item;
}

async function loadRecentActivity() {
    if (!recentActivityList) return;

    recentActivityList.replaceChildren();

    const loading = document.createElement("div");
    loading.className = "server-activity-item";

    const loadingText = document.createElement("span");
    loadingText.textContent = "Loading recent activity...";

    loading.appendChild(loadingText);
    recentActivityList.appendChild(loading);

    try {
        const result = await fetchDashboardData(
            "/api/audit-logs?limit=5&page=1"
        );

        if (!result.success || !Array.isArray(result.data)) {
            throw new Error("Unexpected recent activity response.");
        }

        recentActivityList.replaceChildren();

        if (result.data.length === 0) {
            const emptyItem = document.createElement("div");
            emptyItem.className = "server-activity-item";

            const emptyText = document.createElement("span");
            emptyText.textContent = "No audit activity has been recorded yet.";

            emptyItem.appendChild(emptyText);
            recentActivityList.appendChild(emptyItem);
            return;
        }

        for (const log of result.data) {
            recentActivityList.appendChild(
                createActivityElement(log)
            );
        }
    } catch (error) {
        console.error("Unable to load recent activity:", error);

        recentActivityList.replaceChildren();

        const errorItem = document.createElement("div");
        errorItem.className = "server-activity-item";

        const errorText = document.createElement("span");
        errorText.textContent =
            "Recent activity is temporarily unavailable.";

        errorItem.appendChild(errorText);
        recentActivityList.appendChild(errorItem);
    }
}

// Load both dashboard audit components.
loadAuditSummary();
loadRecentActivity();

    
    /* =====================================================
       LOGOUT
       ===================================================== */

    logoutButton.addEventListener(
        "click",
        async () => {
            try {
                const response = await fetch("/api/auth/logout", {
                    method: "POST"
                });

                if (!response.ok) {
                    throw new Error("Server logout failed.");
                }
            } catch (error) {
                console.error("Logout error:", error);
                alert("Unable to complete logout. Please try again.");
                return;
            }

            sessionStorage.clear();
            window.location.replace("/index.html");
        }
    );

});