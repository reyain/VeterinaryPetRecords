/* =========================================================
   SERVER / ADMINISTRATOR REPORTS
   Temporary frontend prototype
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       USER SESSION
       ===================================================== */

    const currentUser = JSON.parse(
        sessionStorage.getItem("vetCurrentUser")
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
       USER DISPLAY
       ===================================================== */

    const userName =
        document.getElementById("userName");

    const userRole =
        document.getElementById("userRole");

    const userAvatar =
        document.getElementById("userAvatar");

    const logoutButton =
        document.getElementById("logoutButton");


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
       CONTROLS
       ===================================================== */

    const reportType =
        document.getElementById(
            "serverReportType"
        );

    const startDate =
        document.getElementById(
            "serverReportStartDate"
        );

    const endDate =
        document.getElementById(
            "serverReportEndDate"
        );

    const generateButton =
        document.getElementById(
            "generateServerReportButton"
        );

    const resetButton =
        document.getElementById(
            "resetServerReportButton"
        );

    const refreshButton =
        document.getElementById(
            "refreshServerReportButton"
        );

    const printButton =
        document.getElementById(
            "printServerReportButton"
        );

    const message =
        document.getElementById(
            "serverReportMessage"
        );


    /* =====================================================
       STORAGE KEYS
       ===================================================== */

    const STAFF_KEY =
        "vetStaffAccounts";

    const ONLINE_KEY =
        "vetOnlineUsers";

    const AUDIT_KEY =
        "vetAuditLogs";

    const OWNER_KEY =
        "vetPetOwners";

    const PET_KEY =
        "vetPetPets";

    const MEDICAL_KEY =
        "vetPetMedicalRecords";

    const VACCINATION_KEY =
        "vetPetVaccinations";


    /* =====================================================
       HELPERS
       ===================================================== */

    function readStorage(key) {

        const saved =
            localStorage.getItem(key);


        if (!saved) {
            return [];
        }


        try {

            const data =
                JSON.parse(saved);


            return Array.isArray(data)
                ? data
                : [];

        } catch (error) {

            console.error(
                `Unable to read ${key}:`,
                error
            );

            return [];
        }

    }


    function escapeHtml(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function getToday() {

        const now =
            new Date();


        return [
            now.getFullYear(),
            String(
                now.getMonth() + 1
            ).padStart(2, "0"),
            String(
                now.getDate()
            ).padStart(2, "0")
        ].join("-");
    }


    function formatDateTime(value) {

        if (!value) {
            return "—";
        }


        const date =
            new Date(value);


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


    function isDateInRange(
        value,
        start,
        end
    ) {

        if (!value) {
            return false;
        }


        const date =
            String(value).substring(
                0,
                10
            );


        if (
            start &&
            date < start
        ) {

            return false;
        }


        if (
            end &&
            date > end
        ) {

            return false;
        }


        return true;
    }


    /* =====================================================
       GET DATABASE-LIKE DATA
       ===================================================== */

    function getData() {

        return {

            staff:
                readStorage(STAFF_KEY),

            online:
                readStorage(ONLINE_KEY),

            audit:
                readStorage(AUDIT_KEY),

            owners:
                readStorage(OWNER_KEY),

            pets:
                readStorage(PET_KEY),

            medical:
                readStorage(MEDICAL_KEY),

            vaccinations:
                readStorage(VACCINATION_KEY)

        };

    }


    /* =====================================================
       UPDATE SUMMARY CARDS
       ===================================================== */

    function updateSummary(data) {

        document.getElementById(
            "serverReportStaffCount"
        ).textContent =
            data.staff.length;


        document.getElementById(
            "serverReportOnlineCount"
        ).textContent =
            data.online.length;


        document.getElementById(
            "serverReportAuditCount"
        ).textContent =
            data.audit.length;


        document.getElementById(
            "serverReportPetCount"
        ).textContent =
            data.pets.length;


        document.getElementById(
            "serverReportVaccinationCount"
        ).textContent =
            data.vaccinations.length;
    }


    /* =====================================================
       ROLE DISTRIBUTION
       ===================================================== */

    function updateRoleDistribution(
        staff
    ) {

        const frontDesk =
            staff.filter(
                account =>
                    account.role ===
                    "Front Desk"
            ).length;


        const veterinarians =
            staff.filter(
                account =>
                    account.role ===
                    "Veterinarian"
            ).length;


        const total =
            frontDesk +
            veterinarians;


        document.getElementById(
            "frontDeskRoleValue"
        ).textContent =
            frontDesk;


        document.getElementById(
            "veterinarianRoleValue"
        ).textContent =
            veterinarians;


        const frontDeskPercent =
            total > 0
                ? (frontDesk / total) * 100
                : 0;


        const veterinarianPercent =
            total > 0
                ? (veterinarians / total) * 100
                : 0;


        document.getElementById(
            "frontDeskRoleBar"
        ).style.width =
            `${frontDeskPercent}%`;


        document.getElementById(
            "veterinarianRoleBar"
        ).style.width =
            `${veterinarianPercent}%`;
    }


    /* =====================================================
       AUDIT DISTRIBUTION
       ===================================================== */

    function updateAuditDistribution(
        audit
    ) {

        document.getElementById(
            "serverCreateCount"
        ).textContent =
            audit.filter(
                log =>
                    log.action === "Create"
            ).length;


        document.getElementById(
            "serverUpdateCount"
        ).textContent =
            audit.filter(
                log =>
                    log.action === "Update"
            ).length;


        document.getElementById(
            "serverDeleteCount"
        ).textContent =
            audit.filter(
                log =>
                    log.action === "Delete"
            ).length;


        document.getElementById(
            "serverLoginCount"
        ).textContent =
            audit.filter(
                log =>
                    log.action === "Login"
            ).length;
    }


    /* =====================================================
       REPORT DESCRIPTION
       ===================================================== */

    const reportDescriptions = {

        overview:
            "Current summary of staff, users, activity, and veterinary records.",

        staff:
            "Summary of registered staff accounts and their current status.",

        "user-activity":
            "Summary of active users and recorded user activity.",

        audit:
            "Summary of system actions recorded in the audit history.",

        records:
            "Summary of veterinary owners, pets, medical records, and vaccinations."

    };


    /* =====================================================
       GENERATE REPORT ROWS
       ===================================================== */

    function buildReportRows(
        type,
        data
    ) {

        const rows = [];


        /* ================================================
           SYSTEM OVERVIEW
        ================================================= */

        if (type === "overview") {

            rows.push({

                category:
                    "Staff Accounts",

                total:
                    data.staff.length,

                status:
                    data.staff.length > 0
                        ? "Available"
                        : "No Records",

                remarks:
                    "Registered staff accounts."

            });


            rows.push({

                category:
                    "Online Users",

                total:
                    data.online.length,

                status:
                    data.online.length > 0
                        ? "Active"
                        : "None Online",

                remarks:
                    "Currently active sessions."

            });


            rows.push({

                category:
                    "Owners",

                total:
                    data.owners.length,

                status:
                    "Available",

                remarks:
                    "Registered pet owners."

            });


            rows.push({

                category:
                    "Pets",

                total:
                    data.pets.length,

                status:
                    "Available",

                remarks:
                    "Registered veterinary patients."

            });


            rows.push({

                category:
                    "Medical Records",

                total:
                    data.medical.length,

                status:
                    "Available",

                remarks:
                    "Recorded veterinary medical records."

            });


            rows.push({

                category:
                    "Vaccinations",

                total:
                    data.vaccinations.length,

                status:
                    "Available",

                remarks:
                    "Recorded vaccination entries."

            });


            rows.push({

                category:
                    "Audit Logs",

                total:
                    data.audit.length,

                status:
                    data.audit.length > 0
                        ? "Available"
                        : "No Records",

                remarks:
                    "Automatically recorded system activities."

            });

        }


        /* ================================================
           STAFF REPORT
        ================================================= */

        else if (type === "staff") {

            const active =
                data.staff.filter(
                    account =>
                        account.status ===
                        "Active"
                ).length;


            const inactive =
                data.staff.filter(
                    account =>
                        account.status ===
                        "Inactive"
                ).length;


            const frontDesk =
                data.staff.filter(
                    account =>
                        account.role ===
                        "Front Desk"
                ).length;


            const veterinarian =
                data.staff.filter(
                    account =>
                        account.role ===
                        "Veterinarian"
                ).length;


            rows.push({

                category:
                    "Total Staff Accounts",

                total:
                    data.staff.length,

                status:
                    "Available",

                remarks:
                    "All registered staff accounts."

            });


            rows.push({

                category:
                    "Active Accounts",

                total:
                    active,

                status:
                    active > 0
                        ? "Active"
                        : "None",

                remarks:
                    "Accounts currently enabled."

            });


            rows.push({

                category:
                    "Inactive Accounts",

                total:
                    inactive,

                status:
                    inactive > 0
                        ? "Review"
                        : "Clear",

                remarks:
                    "Accounts currently deactivated."

            });


            rows.push({

                category:
                    "Front Desk",

                total:
                    frontDesk,

                status:
                    "Available",

                remarks:
                    "Staff assigned to Front Desk."

            });


            rows.push({

                category:
                    "Veterinarians",

                total:
                    veterinarian,

                status:
                    "Available",

                remarks:
                    "Staff assigned as Veterinarian."

            });

        }


        /* ================================================
           USER ACTIVITY
        ================================================= */

        else if (
            type === "user-activity"
        ) {

            const online =
                data.online.length;


            const logins =
                data.audit.filter(
                    log =>
                        log.action ===
                        "Login"
                ).length;


            const logouts =
                data.audit.filter(
                    log =>
                        log.action ===
                        "Logout"
                ).length;


            rows.push({

                category:
                    "Online Users",

                total:
                    online,

                status:
                    online > 0
                        ? "Active"
                        : "None Online",

                remarks:
                    "Users with current active sessions."

            });


            rows.push({

                category:
                    "Login Activities",

                total:
                    logins,

                status:
                    logins > 0
                        ? "Recorded"
                        : "None",

                remarks:
                    "Recorded login activities."

            });


            rows.push({

                category:
                    "Logout Activities",

                total:
                    logouts,

                status:
                    logouts > 0
                        ? "Recorded"
                        : "None",

                remarks:
                    "Recorded logout activities."

            });

        }


        /* ================================================
           AUDIT REPORT
        ================================================= */

        else if (type === "audit") {

            const creates =
                data.audit.filter(
                    log =>
                        log.action === "Create"
                ).length;


            const updates =
                data.audit.filter(
                    log =>
                        log.action === "Update"
                ).length;


            const deletes =
                data.audit.filter(
                    log =>
                        log.action === "Delete"
                ).length;


            const deactivates =
                data.audit.filter(
                    log =>
                        log.action === "Deactivate"
                ).length;


            rows.push({

                category:
                    "Create Actions",

                total:
                    creates,

                status:
                    "Recorded",

                remarks:
                    "New records created by users."

            });


            rows.push({

                category:
                    "Update Actions",

                total:
                    updates,

                status:
                    "Recorded",

                remarks:
                    "Existing records updated by users."

            });


            rows.push({

                category:
                    "Delete Actions",

                total:
                    deletes,

                status:
                    "Recorded",

                remarks:
                    "Records removed by users."

            });


            rows.push({

                category:
                    "Deactivate Actions",

                total:
                    deactivates,

                status:
                    "Recorded",

                remarks:
                    "Accounts or records deactivated."

            });


            rows.push({

                category:
                    "Total Audit Logs",

                total:
                    data.audit.length,

                status:
                    "Available",

                remarks:
                    "Total recorded system activities."

            });

        }


        /* ================================================
           VETERINARY RECORD REPORT
        ================================================= */

        else if (
            type === "records"
        ) {

            rows.push({

                category:
                    "Owners",

                total:
                    data.owners.length,

                status:
                    "Available",

                remarks:
                    "Registered pet owners."

            });


            rows.push({

                category:
                    "Pets",

                total:
                    data.pets.length,

                status:
                    "Available",

                remarks:
                    "Registered pets."

            });


            rows.push({

                category:
                    "Medical Records",

                total:
                    data.medical.length,

                status:
                    "Available",

                remarks:
                    "Veterinary medical records."

            });


            rows.push({

                category:
                    "Vaccinations",

                total:
                    data.vaccinations.length,

                status:
                    "Available",

                remarks:
                    "Vaccination records."

            });

        }


        return rows;

    }


    /* =====================================================
       STATUS CLASS
       ===================================================== */

    function getStatusClass(
        status
    ) {

        const normalized =
            status.toLowerCase();


        if (
            normalized.includes(
                "review"
            ) ||
            normalized.includes(
                "none online"
            )
        ) {

            return "warning";
        }


        if (
            normalized.includes(
                "recorded"
            ) ||
            normalized.includes(
                "available"
            ) ||
            normalized.includes(
                "active"
            )
        ) {

            return "available";
        }


        return "info";
    }


    /* =====================================================
       RENDER REPORT
       ===================================================== */

    function renderReport() {

        const data =
            getData();


        updateSummary(data);

        updateRoleDistribution(
            data.staff
        );

        updateAuditDistribution(
            data.audit
        );


        const selectedType =
            reportType.value;


        const start =
            startDate.value;

        const end =
            endDate.value;


        if (
            start &&
            end &&
            start > end
        ) {

            message.style.color =
                "#c0392b";

            message.textContent =
                "Start date cannot be later than end date.";

            return;
        }


        /*
            Filter audit records by date when
            an audit-oriented report is selected.
        */

        const filteredData = {

            ...data,

            audit:
                data.audit.filter(log =>
                    !start &&
                    !end
                        ? true
                        : isDateInRange(
                            log.timestamp,
                            start,
                            end
                        )
                )

        };


        const rows =
            buildReportRows(
                selectedType,
                filteredData
            );


        const titles = {

            overview:
                "System Overview",

            staff:
                "Staff Account Report",

            "user-activity":
                "User Activity Report",

            audit:
                "Audit Activity Report",

            records:
                "Veterinary Records Report"

        };


        document.getElementById(
            "serverGeneratedReportTitle"
        ).textContent =
            titles[selectedType];


        document.getElementById(
            "serverGeneratedReportDescription"
        ).textContent =
            reportDescriptions[
                selectedType
            ];


        document.getElementById(
            "serverGeneratedDate"
        ).textContent =
            new Date().toLocaleString(
                "en-US",
                {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit"
                }
            );


        const tableBody =
            document.getElementById(
                "serverReportTableBody"
            );


        tableBody.innerHTML =
            "";


        rows.forEach(
            row => {

                const tableRow =
                    document.createElement(
                        "tr"
                    );


                tableRow.innerHTML = `

                    <td>
                        ${escapeHtml(
                            row.category
                        )}
                    </td>

                    <td>
                        ${row.total}
                    </td>

                    <td>

                        <span
                            class="server-report-status ${getStatusClass(
                                row.status
                            )}"
                        >
                            ${escapeHtml(
                                row.status
                            )}
                        </span>

                    </td>

                    <td>
                        ${escapeHtml(
                            row.remarks
                        )}
                    </td>

                `;


                tableBody.appendChild(
                    tableRow
                );

            }
        );


        message.style.color =
            "#17633a";

        message.textContent =
            "Report generated successfully.";

    }


    /* =====================================================
       GENERATE
       ===================================================== */

    generateButton.addEventListener(
        "click",
        renderReport
    );


    /* =====================================================
       REFRESH
       ===================================================== */

    refreshButton.addEventListener(
        "click",
        () => {

            renderReport();

            message.textContent =
                "Report data refreshed.";

        }
    );


    /* =====================================================
       RESET
       ===================================================== */

    resetButton.addEventListener(
        "click",
        () => {

            reportType.value =
                "overview";

            startDate.value =
                "";

            endDate.value =
                "";

            renderReport();

            message.textContent =
                "Report filters have been reset.";

        }
    );


    /* =====================================================
       PRINT
       ===================================================== */

    printButton.addEventListener(
        "click",
        () => {

            window.print();

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

    renderReport();

});