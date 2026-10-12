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
       TEMPORARY DASHBOARD VALUES
       ===================================================== */

    document.getElementById(
        "staffAccountCount"
    ).textContent = "0";

    document.getElementById(
        "onlineUserCount"
    ).textContent = "0";

    document.getElementById(
        "petCount"
    ).textContent = "0";

    document.getElementById(
        "auditLogCount"
    ).textContent = "0";


    /* =====================================================
       TEMPORARY SERVER STATUS
       ===================================================== */

    document.getElementById(
        "databaseStatus"
    ).textContent = "Not Connected";


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