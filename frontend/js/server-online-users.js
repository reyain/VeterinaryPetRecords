/* =========================================================
   SERVER - ONLINE USERS
   Temporary frontend prototype
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       ELEMENTS
       ===================================================== */

    const userName =
        document.getElementById("userName");

    const userRole =
        document.getElementById("userRole");

    const userAvatar =
        document.getElementById("userAvatar");

    const logoutButton =
        document.getElementById("logoutButton");


    const refreshButton =
        document.getElementById(
            "refreshOnlineUsersButton"
        );

    const searchInput =
        document.getElementById(
            "onlineUserSearch"
        );

    const tableBody =
        document.getElementById(
            "onlineUsersTableBody"
        );

    const emptyState =
        document.getElementById(
            "onlineEmptyState"
        );


    const totalOnlineCount =
        document.getElementById(
            "totalOnlineCount"
        );

    const frontDeskOnlineCount =
        document.getElementById(
            "frontDeskOnlineCount"
        );

    const veterinarianOnlineCount =
        document.getElementById(
            "veterinarianOnlineCount"
        );

    const administratorOnlineCount =
        document.getElementById(
            "administratorOnlineCount"
        );


    const visibleOnlineCount =
        document.getElementById(
            "visibleOnlineCount"
        );

    const message =
        document.getElementById(
            "onlineUserMessage"
        );


    /* =====================================================
       ADMIN SESSION CHECK
       ===================================================== */

    const currentUser = JSON.parse(
        sessionStorage.getItem(
            "vetCurrentUser"
        )
    );


    if (
        !currentUser ||
        currentUser.role !== "Administrator"
    ) {

        window.location.href =
            "../../index.html";

        return;
    }


    /* =====================================================
       DISPLAY ADMINISTRATOR
       ===================================================== */

    const administratorName =
        currentUser.fullName ||
        currentUser.username ||
        "Administrator";


    userName.textContent =
        administratorName;

    userRole.textContent =
        "Administrator";

    userAvatar.textContent =
        administratorName
            .charAt(0)
            .toUpperCase();


    /* =====================================================
       STORAGE
       ===================================================== */

    const STORAGE_KEY =
        "vetOnlineUsers";


    /* =====================================================
       CREATE DEMO ONLINE USERS
       ===================================================== */

    function createDemoUsers() {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (saved) {

            try {

                return JSON.parse(saved);

            } catch (error) {

                console.error(
                    "Unable to read online users:",
                    error
                );
            }
        }


        const now =
            new Date();


        const demoUsers = [

            {
                sessionId:
                    "SESSION-0001",

                userId:
                    "USR-0001",

                fullName:
                    "Front Desk",

                username:
                    "frontdesk",

                role:
                    "Front Desk",

                loginTime:
                    new Date(
                        now.getTime() - 35 * 60000
                    ).toISOString(),

                lastActivity:
                    new Date(
                        now.getTime() - 2 * 60000
                    ).toISOString(),

                status:
                    "Online"
            },


            {
                sessionId:
                    "SESSION-0002",

                userId:
                    "USR-0002",

                fullName:
                    "Veterinarian",

                username:
                    "veterinarian",

                role:
                    "Veterinarian",

                loginTime:
                    new Date(
                        now.getTime() - 52 * 60000
                    ).toISOString(),

                lastActivity:
                    new Date(
                        now.getTime() - 5 * 60000
                    ).toISOString(),

                status:
                    "Online"
            }

        ];


        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(demoUsers)
        );


        return demoUsers;
    }


    /* =====================================================
       GET ONLINE USERS
       ===================================================== */

    function getOnlineUsers() {

        return createDemoUsers();

    }


    /* =====================================================
       SAVE ONLINE USERS
       ===================================================== */

    function saveOnlineUsers(users) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(users)
        );
    }


    /* =====================================================
       FORMAT DATE AND TIME
       ===================================================== */

    function formatDateTime(
        dateString
    ) {

        if (!dateString) {
            return "—";
        }


        const date =
            new Date(dateString);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "—";
        }


        return date.toLocaleString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit"
            }
        );
    }


    /* =====================================================
       UPDATE SUMMARY
       ===================================================== */

    function updateSummary(users) {

        totalOnlineCount.textContent =
            users.length;


        frontDeskOnlineCount.textContent =
            users.filter(
                user =>
                    user.role === "Front Desk"
            ).length;


        veterinarianOnlineCount.textContent =
            users.filter(
                user =>
                    user.role === "Veterinarian"
            ).length;


        administratorOnlineCount.textContent =
            users.filter(
                user =>
                    user.role === "Administrator"
            ).length;
    }


    /* =====================================================
       RENDER TABLE
       ===================================================== */

    function renderUsers() {

        const users =
            getOnlineUsers();


        const searchTerm =
            searchInput.value
                .trim()
                .toLowerCase();


        const filteredUsers =
            users.filter(user => {

                return (

                    user.userId
                        .toLowerCase()
                        .includes(searchTerm) ||

                    user.fullName
                        .toLowerCase()
                        .includes(searchTerm) ||

                    user.username
                        .toLowerCase()
                        .includes(searchTerm) ||

                    user.role
                        .toLowerCase()
                        .includes(searchTerm)
                );

            });


        tableBody.innerHTML = "";


        filteredUsers.forEach(
            user => {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                            user.userId
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            user.fullName
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            user.username
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            user.role
                        )}
                    </td>

                    <td>
                        ${formatDateTime(
                            user.loginTime
                        )}
                    </td>

                    <td>
                        ${formatDateTime(
                            user.lastActivity
                        )}
                    </td>

                    <td>

                        <span
                            class="online-status active"
                        >
                            Online
                        </span>

                    </td>

                    <td>

                        <button
                            type="button"
                            class="online-disconnect-button"
                            data-session-id="${escapeHtml(
                                user.sessionId
                            )}"
                        >
                            Disconnect
                        </button>

                    </td>

                `;


                tableBody.appendChild(
                    row
                );

            }
        );


        updateSummary(users);


        visibleOnlineCount.textContent =
            filteredUsers.length;


        if (
            filteredUsers.length === 0
        ) {

            emptyState.style.display =
                "block";

        } else {

            emptyState.style.display =
                "none";
        }

    }


    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHtml(value) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );
    }


    /* =====================================================
       DISCONNECT SESSION
       ===================================================== */

    function disconnectUser(
        sessionId
    ) {

        const users =
            getOnlineUsers();


        const user =
            users.find(
                item =>
                    item.sessionId ===
                    sessionId
            );


        if (!user) {
            return;
        }


        /*
            Administrator protection:
            Do not disconnect the Administrator
            from this page.
        */

        if (
            user.role ===
            "Administrator"
        ) {

            alert(
                "The Administrator session cannot be disconnected from this prototype."
            );

            return;
        }


        const confirmed =
            confirm(
                `Disconnect ${user.fullName} from the current session?`
            );


        if (!confirmed) {
            return;
        }


        const updatedUsers =
            users.filter(
                item =>
                    item.sessionId !==
                    sessionId
            );


        saveOnlineUsers(
            updatedUsers
        );


        message.textContent =
            `${user.fullName} has been disconnected from the online-user list.`;


        renderUsers();

    }


    /* =====================================================
       TABLE ACTION
       ===================================================== */

    tableBody.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-session-id]"
                );


            if (!button) {
                return;
            }


            disconnectUser(
                button.dataset.sessionId
            );

        }
    );


    /* =====================================================
       SEARCH
       ===================================================== */

    searchInput.addEventListener(
        "input",
        renderUsers
    );


    /* =====================================================
       REFRESH
       ===================================================== */

    refreshButton.addEventListener(
        "click",
        () => {

            message.textContent =
                "Online user list refreshed.";

            renderUsers();

        }
    );


    /* =====================================================
       LOGOUT
       ===================================================== */

    logoutButton.addEventListener(
        "click",
        () => {

            sessionStorage.removeItem(
                "vetCurrentUser"
            );

            window.location.href =
                "../../index.html";
        }
    );


    /* =====================================================
       INITIAL LOAD
       ===================================================== */

    renderUsers();

});