/* =========================================================
   SERVER - AUDIT LOGS
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
            "refreshAuditButton"
        );

    const searchInput =
        document.getElementById(
            "auditSearch"
        );

    const moduleFilter =
        document.getElementById(
            "auditModuleFilter"
        );

    const actionFilter =
        document.getElementById(
            "auditActionFilter"
        );

    const roleFilter =
        document.getElementById(
            "auditRoleFilter"
        );

    const dateFilter =
        document.getElementById(
            "auditDateFilter"
        );

    const resetButton =
        document.getElementById(
            "resetAuditButton"
        );

    const tableBody =
        document.getElementById(
            "auditTableBody"
        );

    const emptyState =
        document.getElementById(
            "auditEmptyState"
        );

    const visibleAuditCount =
        document.getElementById(
            "visibleAuditCount"
        );

    const message =
        document.getElementById(
            "auditMessage"
        );


    /* SUMMARY ELEMENTS */

    const totalAuditCount =
        document.getElementById(
            "totalAuditCount"
        );

    const todayAuditCount =
        document.getElementById(
            "todayAuditCount"
        );

    const createAuditCount =
        document.getElementById(
            "createAuditCount"
        );

    const updateAuditCount =
        document.getElementById(
            "updateAuditCount"
        );

    const deleteAuditCount =
        document.getElementById(
            "deleteAuditCount"
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
        "vetAuditLogs";


    /* =====================================================
       GET TODAY
       ===================================================== */

    function getTodayString() {

        const today =
            new Date();

        const year =
            today.getFullYear();

        const month =
            String(
                today.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                today.getDate()
            ).padStart(2, "0");


        return `${year}-${month}-${day}`;
    }


    /* =====================================================
       CREATE DEMO AUDIT LOGS
       ===================================================== */

    function createDemoLogs() {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (saved) {

            try {

                return JSON.parse(saved);

            } catch (error) {

                console.error(
                    "Unable to read audit logs:",
                    error
                );
            }
        }


        const now =
            new Date();


        const createTimestamp =
            new Date(
                now.getTime() -
                90 * 60000
            );

        const updateTimestamp =
            new Date(
                now.getTime() -
                55 * 60000
            );

        const medicalTimestamp =
            new Date(
                now.getTime() -
                35 * 60000
            );

        const vaccinationTimestamp =
            new Date(
                now.getTime() -
                18 * 60000
            );

        const loginTimestamp =
            new Date(
                now.getTime() -
                120 * 60000
            );


        const demoLogs = [

            {
                auditId:
                    "LOG-0001",

                timestamp:
                    loginTimestamp.toISOString(),

                userId:
                    "USR-0001",

                username:
                    "frontdesk",

                fullName:
                    "Front Desk",

                role:
                    "Front Desk",

                module:
                    "Authentication",

                action:
                    "Login",

                recordId:
                    "—",

                description:
                    "Front Desk user logged into the Client System."
            },


            {
                auditId:
                    "LOG-0002",

                timestamp:
                    createTimestamp.toISOString(),

                userId:
                    "USR-0001",

                username:
                    "frontdesk",

                fullName:
                    "Front Desk",

                role:
                    "Front Desk",

                module:
                    "Owners",

                action:
                    "Create",

                recordId:
                    "OWN-0001",

                description:
                    "Created a new owner record."
            },


            {
                auditId:
                    "LOG-0003",

                timestamp:
                    updateTimestamp.toISOString(),

                userId:
                    "USR-0001",

                username:
                    "frontdesk",

                fullName:
                    "Front Desk",

                role:
                    "Front Desk",

                module:
                    "Pets",

                action:
                    "Update",

                recordId:
                    "PET-0001",

                description:
                    "Updated an existing pet record."
            },


            {
                auditId:
                    "LOG-0004",

                timestamp:
                    medicalTimestamp.toISOString(),

                userId:
                    "USR-0002",

                username:
                    "veterinarian",

                fullName:
                    "Veterinarian",

                role:
                    "Veterinarian",

                module:
                    "Medical Records",

                action:
                    "Create",

                recordId:
                    "MED-0001",

                description:
                    "Created a new medical record."
            },


            {
                auditId:
                    "LOG-0005",

                timestamp:
                    vaccinationTimestamp.toISOString(),

                userId:
                    "USR-0002",

                username:
                    "veterinarian",

                fullName:
                    "Veterinarian",

                role:
                    "Veterinarian",

                module:
                    "Vaccinations",

                action:
                    "Create",

                recordId:
                    "VAC-0001",

                description:
                    "Created a new vaccination record."
            }

        ];


        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(demoLogs)
        );


        return demoLogs;
    }


    /* =====================================================
       GET LOGS
       ===================================================== */

    function getLogs() {

        return createDemoLogs();

    }


    /* =====================================================
       SAVE LOGS
       ===================================================== */

    function saveLogs(logs) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(logs)
        );
    }


    /* =====================================================
       FORMAT DATE AND TIME
       ===================================================== */

    function formatDateTime(
        timestamp
    ) {

        const date =
            new Date(timestamp);


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
       ACTION CLASS
       ===================================================== */

    function getActionClass(
        action
    ) {

        return action
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            );
    }


    /* =====================================================
       UPDATE SUMMARY
       ===================================================== */

    function updateSummary(
        logs
    ) {

        const today =
            getTodayString();


        totalAuditCount.textContent =
            logs.length;


        todayAuditCount.textContent =
            logs.filter(log =>
                log.timestamp
                    .startsWith(today)
            ).length;


        createAuditCount.textContent =
            logs.filter(
                log =>
                    log.action === "Create"
            ).length;


        updateAuditCount.textContent =
            logs.filter(
                log =>
                    log.action === "Update"
            ).length;


        deleteAuditCount.textContent =
            logs.filter(
                log =>
                    log.action === "Delete"
            ).length;
    }


    /* =====================================================
       RENDER TABLE
       ===================================================== */

    function renderLogs() {

        const logs =
            getLogs();


        const searchTerm =
            searchInput.value
                .trim()
                .toLowerCase();

        const selectedModule =
            moduleFilter.value;

        const selectedAction =
            actionFilter.value;

        const selectedRole =
            roleFilter.value;

        const selectedDate =
            dateFilter.value;


        const filteredLogs =
            logs
                .filter(log => {

                    const matchesSearch =
                        !searchTerm ||
                        log.auditId
                            .toLowerCase()
                            .includes(searchTerm) ||
                        log.userId
                            .toLowerCase()
                            .includes(searchTerm) ||
                        log.username
                            .toLowerCase()
                            .includes(searchTerm) ||
                        log.fullName
                            .toLowerCase()
                            .includes(searchTerm) ||
                        log.recordId
                            .toLowerCase()
                            .includes(searchTerm) ||
                        log.description
                            .toLowerCase()
                            .includes(searchTerm);


                    const matchesModule =
                        selectedModule === "all" ||
                        log.module === selectedModule;


                    const matchesAction =
                        selectedAction === "all" ||
                        log.action === selectedAction;


                    const matchesRole =
                        selectedRole === "all" ||
                        log.role === selectedRole;


                    const logDate =
                        log.timestamp
                            .substring(0, 10);


                    const matchesDate =
                        !selectedDate ||
                        logDate === selectedDate;


                    return (
                        matchesSearch &&
                        matchesModule &&
                        matchesAction &&
                        matchesRole &&
                        matchesDate
                    );

                })
                .sort(
                    (a, b) =>
                        new Date(b.timestamp) -
                        new Date(a.timestamp)
                );


        tableBody.innerHTML =
            "";


        filteredLogs.forEach(
            log => {

                const row =
                    document.createElement(
                        "tr"
                    );


                const actionClass =
                    getActionClass(
                        log.action
                    );


                row.innerHTML = `

                    <td>
                        ${escapeHtml(
                            log.auditId
                        )}
                    </td>

                    <td>
                        ${formatDateTime(
                            log.timestamp
                        )}
                    </td>

                    <td>

                        <strong>
                            ${escapeHtml(
                                log.fullName
                            )}
                        </strong>

                        <br>

                        <small>
                            @${escapeHtml(
                                log.username
                            )}
                        </small>

                    </td>

                    <td>
                        ${escapeHtml(
                            log.role
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            log.module
                        )}
                    </td>

                    <td>

                        <span
                            class="audit-action ${actionClass}"
                        >
                            ${escapeHtml(
                                log.action
                            )}
                        </span>

                    </td>

                    <td>
                        ${escapeHtml(
                            log.recordId
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            log.description
                        )}
                    </td>

                `;


                tableBody.appendChild(
                    row
                );

            }
        );


        updateSummary(logs);


        visibleAuditCount.textContent =
            filteredLogs.length;


        if (
            filteredLogs.length === 0
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

    function escapeHtml(
        value
    ) {

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
       RESET FILTERS
       ===================================================== */

    resetButton.addEventListener(
        "click",
        () => {

            searchInput.value =
                "";

            moduleFilter.value =
                "all";

            actionFilter.value =
                "all";

            roleFilter.value =
                "all";

            dateFilter.value =
                "";

            message.textContent =
                "Filters have been reset.";

            renderLogs();

        }
    );


    /* =====================================================
       LIVE FILTERS
       ===================================================== */

    searchInput.addEventListener(
        "input",
        renderLogs
    );

    moduleFilter.addEventListener(
        "change",
        renderLogs
    );

    actionFilter.addEventListener(
        "change",
        renderLogs
    );

    roleFilter.addEventListener(
        "change",
        renderLogs
    );

    dateFilter.addEventListener(
        "change",
        renderLogs
    );


    /* =====================================================
       REFRESH
       ===================================================== */

    refreshButton.addEventListener(
        "click",
        () => {

            message.textContent =
                "Audit logs refreshed.";

            renderLogs();

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

    renderLogs();

});