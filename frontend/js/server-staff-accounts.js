/* =========================================================
   SERVER - STAFF ACCOUNT MANAGEMENT
   Temporary frontend version using localStorage
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


    const addStaffButton =
        document.getElementById("addStaffButton");

    const staffSearch =
        document.getElementById("staffSearch");

    const staffTableBody =
        document.getElementById("staffTableBody");

    const staffEmptyState =
        document.getElementById("staffEmptyState");

    const totalStaffCount =
        document.getElementById("totalStaffCount");

    const activeStaffCount =
        document.getElementById("activeStaffCount");

    const inactiveStaffCount =
        document.getElementById("inactiveStaffCount");

    const visibleStaffCount =
        document.getElementById("visibleStaffCount");

    const staffMessage =
        document.getElementById("staffMessage");


    const staffModal =
        document.getElementById("staffModal");

    const closeStaffModal =
        document.getElementById("closeStaffModal");

    const cancelStaffButton =
        document.getElementById("cancelStaffButton");

    const staffForm =
        document.getElementById("staffForm");

    const modalTitle =
        document.getElementById("modalTitle");

    const staffUserId =
        document.getElementById("staffUserId");

    const staffFullName =
        document.getElementById("staffFullName");

    const staffUsername =
        document.getElementById("staffUsername");

    const staffPassword =
        document.getElementById("staffPassword");

    const passwordGroup =
        document.getElementById("passwordGroup");

    const staffRole =
        document.getElementById("staffRole");

    const staffStatus =
        document.getElementById("staffStatus");

    const staffFormMessage =
        document.getElementById("staffFormMessage");


    /* =====================================================
       ADMIN SESSION CHECK
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
       STORAGE KEY
       ===================================================== */

    const STORAGE_KEY =
        "vetStaffAccounts";


    /* =====================================================
       GET ACCOUNTS
       ===================================================== */

    function getAccounts() {

        const saved =
            localStorage.getItem(STORAGE_KEY);


        if (!saved) {

            const defaultAccounts = [

                {
                    userId: "USR-0001",
                    username: "frontdesk",
                    password: "front123",
                    fullName: "Front Desk",
                    role: "Front Desk",
                    status: "Active",
                    createdAt: "2026-10-01"
                },

                {
                    userId: "USR-0002",
                    username: "veterinarian",
                    password: "vet123",
                    fullName: "Veterinarian",
                    role: "Veterinarian",
                    status: "Active",
                    createdAt: "2026-10-01"
                }

            ];


            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(defaultAccounts)
            );


            return defaultAccounts;
        }


        try {

            return JSON.parse(saved);

        } catch (error) {

            console.error(
                "Unable to read staff accounts:",
                error
            );

            return [];
        }
    }


    /* =====================================================
       SAVE ACCOUNTS
       ===================================================== */

    function saveAccounts(accounts) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(accounts)
        );
    }


    /* =====================================================
       GENERATE USER ID
       ===================================================== */

    function generateUserId(accounts) {

        let highestNumber = 0;


        accounts.forEach(account => {

            const match =
                account.userId.match(
                    /USR-(\d+)/
                );


            if (match) {

                const number =
                    parseInt(match[1], 10);


                if (
                    number >
                    highestNumber
                ) {

                    highestNumber =
                        number;
                }

            }

        });


        return `USR-${String(
            highestNumber + 1
        ).padStart(4, "0")}`;
    }


    /* =====================================================
       UPDATE SUMMARY
       ===================================================== */

    function updateSummary(accounts) {

        const active =
            accounts.filter(
                account =>
                    account.status === "Active"
            ).length;


        const inactive =
            accounts.filter(
                account =>
                    account.status === "Inactive"
            ).length;


        totalStaffCount.textContent =
            accounts.length;

        activeStaffCount.textContent =
            active;

        inactiveStaffCount.textContent =
            inactive;
    }


    /* =====================================================
       FORMAT DATE
       ===================================================== */

    function formatDate(dateString) {

        if (!dateString) {
            return "—";
        }


        const date =
            new Date(dateString);


        if (Number.isNaN(date.getTime())) {
            return dateString;
        }


        return date.toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );
    }


    /* =====================================================
       RENDER TABLE
       ===================================================== */

    function renderAccounts() {

        const accounts =
            getAccounts();


        const searchTerm =
            staffSearch.value
                .trim()
                .toLowerCase();


        const filteredAccounts =
            accounts.filter(account => {

                return (
                    account.userId
                        .toLowerCase()
                        .includes(searchTerm) ||

                    account.fullName
                        .toLowerCase()
                        .includes(searchTerm) ||

                    account.username
                        .toLowerCase()
                        .includes(searchTerm) ||

                    account.role
                        .toLowerCase()
                        .includes(searchTerm) ||

                    account.status
                        .toLowerCase()
                        .includes(searchTerm)
                );

            });


        staffTableBody.innerHTML = "";


        filteredAccounts.forEach(
            account => {

                const row =
                    document.createElement("tr");


                const statusClass =
                    account.status === "Active"
                        ? "active"
                        : "inactive";


                const nextStatus =
                    account.status === "Active"
                        ? "Inactive"
                        : "Active";


                row.innerHTML = `

                    <td>
                        ${escapeHtml(account.userId)}
                    </td>

                    <td>
                        ${escapeHtml(account.fullName)}
                    </td>

                    <td>
                        ${escapeHtml(account.username)}
                    </td>

                    <td>
                        ${escapeHtml(account.role)}
                    </td>

                    <td>

                        <span
                            class="staff-status ${statusClass}"
                        >
                            ${escapeHtml(account.status)}
                        </span>

                    </td>

                    <td>
                        ${formatDate(account.createdAt)}
                    </td>

                    <td>

                        <div class="staff-actions">

                            <button
                                type="button"
                                class="staff-action-button edit"
                                data-action="edit"
                                data-id="${account.userId}"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="staff-action-button reset"
                                data-action="reset"
                                data-id="${account.userId}"
                            >
                                Reset Password
                            </button>

                            <button
                                type="button"
                                class="staff-action-button toggle"
                                data-action="toggle"
                                data-id="${account.userId}"
                            >
                                ${nextStatus}
                            </button>

                        </div>

                    </td>

                `;


                staffTableBody.appendChild(row);
            }
        );


        updateSummary(accounts);


        visibleStaffCount.textContent =
            filteredAccounts.length;


        if (
            filteredAccounts.length === 0
        ) {

            staffEmptyState.style.display =
                "block";

        } else {

            staffEmptyState.style.display =
                "none";
        }
    }


    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHtml(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       OPEN ADD MODAL
       ===================================================== */

    function openAddModal() {

        const accounts =
            getAccounts();


        modalTitle.textContent =
            "Add Staff Account";


        staffForm.reset();


        staffUserId.value =
            generateUserId(accounts);


        staffPassword.required =
            true;

        passwordGroup.style.display =
            "block";


        staffStatus.value =
            "Active";


        staffFormMessage.textContent = "";


        staffModal.style.display =
            "flex";
    }


    /* =====================================================
       OPEN EDIT MODAL
       ===================================================== */

    function openEditModal(userId) {

        const accounts =
            getAccounts();


        const account =
            accounts.find(
                item =>
                    item.userId === userId
            );


        if (!account) {
            return;
        }


        modalTitle.textContent =
            "Edit Staff Account";


        staffUserId.value =
            account.userId;

        staffFullName.value =
            account.fullName;

        staffUsername.value =
            account.username;

        staffRole.value =
            account.role;

        staffStatus.value =
            account.status;


        /*
            Password is not edited directly.
            Administrator can use Reset Password.
        */

        staffPassword.value = "";

        staffPassword.required =
            false;

        passwordGroup.style.display =
            "none";


        staffFormMessage.textContent = "";


        staffModal.style.display =
            "flex";
    }


    /* =====================================================
       CLOSE MODAL
       ===================================================== */

    function closeModal() {

        staffModal.style.display =
            "none";

        staffForm.reset();

        staffFormMessage.textContent = "";
    }


    /* =====================================================
       ADD / UPDATE ACCOUNT
       ===================================================== */

    staffForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const accounts =
                getAccounts();


            const fullName =
                staffFullName.value
                    .trim();

            const username =
                staffUsername.value
                    .trim()
                    .toLowerCase();

            const password =
                staffPassword.value;

            const role =
                staffRole.value;

            const status =
                staffStatus.value;


            if (!fullName) {

                staffFormMessage.textContent =
                    "Please enter the staff member's full name.";

                return;
            }


            if (!username) {

                staffFormMessage.textContent =
                    "Please enter a username.";

                return;
            }


            if (!role) {

                staffFormMessage.textContent =
                    "Please select a role.";

                return;
            }


            if (!status) {

                staffFormMessage.textContent =
                    "Please select an account status.";

                return;
            }


            /*
                Determine whether this is Add
                or Edit.
            */

            const existingAccount =
                accounts.find(
                    account =>
                        account.userId ===
                        staffUserId.value
                );


            /* =================================================
               ADD
            ================================================== */

            if (!existingAccount) {

                if (!password) {

                    staffFormMessage.textContent =
                        "Please enter a password.";

                    return;
                }


                if (password.length < 6) {

                    staffFormMessage.textContent =
                        "Password must contain at least 6 characters.";

                    return;
                }


                const duplicateUsername =
                    accounts.some(
                        account =>
                            account.username
                                .toLowerCase() ===
                            username
                    );


                if (duplicateUsername) {

                    staffFormMessage.textContent =
                        "That username is already in use.";

                    return;
                }


                accounts.push({

                    userId:
                        staffUserId.value,

                    username:
                        username,

                    password:
                        password,

                    fullName:
                        fullName,

                    role:
                        role,

                    status:
                        status,

                    createdAt:
                        new Date()
                            .toISOString()
                            .split("T")[0]

                });


                saveAccounts(accounts);


                staffMessage.style.color =
                    "#17633a";

                staffMessage.textContent =
                    "Staff account added successfully.";


            }


            /* =================================================
               EDIT
            ================================================== */

            else {

                const duplicateUsername =
                    accounts.some(
                        account =>
                            account.userId !==
                            existingAccount.userId &&

                            account.username
                                .toLowerCase() ===
                            username
                    );


                if (duplicateUsername) {

                    staffFormMessage.textContent =
                        "That username is already in use.";

                    return;
                }


                existingAccount.fullName =
                    fullName;

                existingAccount.username =
                    username;

                existingAccount.role =
                    role;

                existingAccount.status =
                    status;


                saveAccounts(accounts);


                staffMessage.style.color =
                    "#17633a";

                staffMessage.textContent =
                    "Staff account updated successfully.";
            }


            closeModal();

            renderAccounts();

        }
    );


    /* =====================================================
       TABLE ACTIONS
       ===================================================== */

    staffTableBody.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-action]"
                );


            if (!button) {
                return;
            }


            const action =
                button.dataset.action;

            const userId =
                button.dataset.id;


            if (action === "edit") {

                openEditModal(userId);

                return;
            }


            if (action === "reset") {

                resetPassword(userId);

                return;
            }


            if (action === "toggle") {

                toggleStatus(userId);

                return;
            }

        }
    );


    /* =====================================================
       RESET PASSWORD
       ===================================================== */

    function resetPassword(userId) {

        const accounts =
            getAccounts();


        const account =
            accounts.find(
                item =>
                    item.userId === userId
            );


        if (!account) {
            return;
        }


        const newPassword =
            prompt(
                `Enter a new password for ${account.username}:\n\nMinimum of 6 characters.`
            );


        if (newPassword === null) {
            return;
        }


        if (newPassword.length < 6) {

            alert(
                "Password must contain at least 6 characters."
            );

            return;
        }


        account.password =
            newPassword;


        saveAccounts(accounts);


        staffMessage.style.color =
            "#17633a";

        staffMessage.textContent =
            `Password reset successfully for ${account.username}.`;

    }


    /* =====================================================
       TOGGLE STATUS
       ===================================================== */

    function toggleStatus(userId) {

        const accounts =
            getAccounts();


        const account =
            accounts.find(
                item =>
                    item.userId === userId
            );


        if (!account) {
            return;
        }


        const newStatus =
            account.status === "Active"
                ? "Inactive"
                : "Active";


        account.status =
            newStatus;


        saveAccounts(accounts);


        staffMessage.style.color =
            "#17633a";

        staffMessage.textContent =
            `${account.username} is now ${newStatus}.`;


        renderAccounts();

    }


    /* =====================================================
       SEARCH
       ===================================================== */

    staffSearch.addEventListener(
        "input",
        renderAccounts
    );


    /* =====================================================
       OPEN ADD
       ===================================================== */

    addStaffButton.addEventListener(
        "click",
        openAddModal
    );


    /* =====================================================
       CLOSE BUTTONS
       ===================================================== */

    closeStaffModal.addEventListener(
        "click",
        closeModal
    );


    cancelStaffButton.addEventListener(
        "click",
        closeModal
    );


    /* =====================================================
       CLOSE WHEN CLICKING OUTSIDE
       ===================================================== */

    staffModal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                staffModal
            ) {

                closeModal();
            }

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
       INITIAL RENDER
       ===================================================== */

    renderAccounts();

});