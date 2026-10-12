const clientSidebar =
    document.getElementById("clientSidebar");

const menuButton =
    document.getElementById("menuButton");

const logoutButton =
    document.getElementById("logoutButton");


// =========================
// CHECK USER SESSION
// =========================

const username =
    sessionStorage.getItem(
        "demoUsername"
    );

const role =
    sessionStorage.getItem(
        "demoRole"
    );


/*
    Only Front Desk and Veterinarian
    are allowed to use the client side.
*/


const allowedRoles = [
    "Front Desk",
    "Veterinarian",
    "Staff"
];



if (
    !username ||
    !allowedRoles.includes(role)
) {

    window.location.href =
        "../../index.html";

}


// =========================
// USER DISPLAY
// =========================

if (username && role) {

    const displayName =
        username.charAt(0).toUpperCase()
        + username.slice(1);


    document.getElementById(
        "userName"
    ).textContent =
        displayName;


    document.getElementById(
        "userRole"
    ).textContent =
        role;


    document.getElementById(
        "welcomeHeading"
    ).textContent =
        `Welcome, ${displayName}`;


    document.getElementById(
        "welcomeDescription"
    ).textContent =
        `You are signed in as ${role}. ` +
        `Use the client system to manage veterinary records.`;
    

    document.getElementById(
        "userAvatar"
    ).textContent =
        displayName
            .charAt(0)
            .toUpperCase();


    document.getElementById(
        "accessType"
    ).textContent =
        `Client — ${role}`;

}


// =========================
// MOBILE SIDEBAR
// =========================

if (menuButton) {

    menuButton.addEventListener(
        "click",
        () => {

            clientSidebar.classList.toggle(
                "open"
            );

        }
    );

}


// =========================
// LOGOUT
// =========================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async () => {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );


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

}


/* =========================
   LOAD LIVE DASHBOARD TOTALS
========================= */

async function loadDashboardSummary() {
    try {
        const endpoints = [
            "/api/owners",
            "/api/pets",
            "/api/medical-records",
            "/api/vaccinations"
        ];

        const responses = await Promise.all(
            endpoints.map(async endpoint => {
                const response = await fetch(endpoint);

                if (!response.ok) {
                    throw new Error(
                        `Request failed for ${endpoint}: ${response.status}`
                    );
                }

                const result = await response.json();

                if (
                    result.success !== true ||
                    !Array.isArray(result.data)
                ) {
                    throw new Error(
                        `Invalid data returned by ${endpoint}`
                    );
                }

                return result.data;
            })
        );

        const [
            owners,
            pets,
            medicalRecords,
            vaccinations
        ] = responses;

        document.getElementById("ownerCount").textContent =
            owners.length;

        document.getElementById("petCount").textContent =
            pets.length;

        document.getElementById("medicalCount").textContent =
            medicalRecords.length;

        document.getElementById("vaccinationCount").textContent =
            vaccinations.length;

    } catch (error) {
        console.error(
            "Unable to load dashboard totals:",
            error
        );
    }
}

loadDashboardSummary();
