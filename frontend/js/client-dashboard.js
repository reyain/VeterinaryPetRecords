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
    "Veterinarian"
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
        () => {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (confirmed) {

                sessionStorage.clear();

                window.location.href =
                    "../../index.html";

            }

        }
    );

}