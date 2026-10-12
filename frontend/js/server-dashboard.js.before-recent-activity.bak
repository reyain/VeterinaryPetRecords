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
auditCount.textContent = "N/A";

staffCount.title = "Staff account API is not implemented yet.";
onlineCount.title = "Online user monitoring API is not implemented yet.";
auditCount.title = "Audit log API is not implemented yet.";

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