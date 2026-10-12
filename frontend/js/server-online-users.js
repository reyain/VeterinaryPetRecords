
/* =========================================================
   SERVER - ONLINE USERS
   Live API integration
   Administrator read-only monitoring
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    let currentUser = null;

    try {
        currentUser = JSON.parse(
            sessionStorage.getItem("vetCurrentUser") || "null"
        );
    } catch {
        currentUser = null;
    }

    const role = String(currentUser?.role || "")
        .trim()
        .toLowerCase();

    if (!currentUser || !["admin", "administrator"].includes(role)) {
        window.location.replace("/index.html");
        return;
    }

    const getElement = id => document.getElementById(id);

    const userName = getElement("userName");
    const userRole = getElement("userRole");
    const userAvatar = getElement("userAvatar");
    const logoutButton = getElement("logoutButton");

    const refreshButton = getElement("refreshOnlineUsersButton");
    const searchInput = getElement("onlineUserSearch");
    const tableBody = getElement("onlineUsersTableBody");
    const emptyState = getElement("onlineEmptyState");
    const visibleOnlineCount = getElement("visibleOnlineCount");
    const message = getElement("onlineUserMessage");

    const totalOnlineCount = getElement("totalOnlineCount");
    const staffOnlineCount = getElement("staffOnlineCount");
    const adminOnlineCount = getElement("adminOnlineCount");
    const otherRolesOnlineCount = getElement("otherRolesOnlineCount");

    const administratorName =
        currentUser.fullName ||
        currentUser.username ||
        "Administrator";

    userName.textContent = administratorName;
    userRole.textContent = "Administrator";
    userAvatar.textContent =
        administratorName.trim().charAt(0).toUpperCase() || "A";

    let onlineUsers = [];
    let requestNumber = 0;

    function formatDateTime(value) {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "—";
        }

        return date.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    }

    function createCell(value) {
        const cell = document.createElement("td");
        cell.textContent =
            value === null || value === undefined || value === ""
                ? "—"
                : String(value);

        return cell;
    }

    function updateSummary(summary) {
        totalOnlineCount.textContent =
            Number(summary.totalOnline ?? onlineUsers.length);

        staffOnlineCount.textContent =
            Number(summary.staffOnline ?? 0);

        adminOnlineCount.textContent =
            Number(summary.administratorOnline ?? 0);

        otherRolesOnlineCount.textContent =
            Number(summary.otherRolesOnline ?? 0);
    }

    function renderUsers() {
        const searchTerm = searchInput.value.trim().toLowerCase();

        const filteredUsers = onlineUsers.filter(user => {
            const searchableValues = [
                user.userId,
                user.fullName,
                user.username,
                user.role,
                user.accountStatus,
                user.status,
                user.sessionExpiresAt
            ];

            return searchableValues.some(value =>
                String(value ?? "").toLowerCase().includes(searchTerm)
            );
        });

        tableBody.replaceChildren();

        for (const user of filteredUsers) {
            const row = document.createElement("tr");

            row.appendChild(createCell(user.userId));
            row.appendChild(createCell(user.fullName));
            row.appendChild(createCell(user.username));
            row.appendChild(createCell(user.role));
            row.appendChild(createCell(
                formatDateTime(user.sessionExpiresAt)
            ));

            const statusCell = document.createElement("td");
            const statusBadge = document.createElement("span");

            statusBadge.className = "online-status active";
            statusBadge.textContent = user.status || "Online";

            statusCell.appendChild(statusBadge);
            row.appendChild(statusCell);

            tableBody.appendChild(row);
        }

        visibleOnlineCount.textContent = String(filteredUsers.length);
        emptyState.style.display =
            filteredUsers.length === 0 ? "block" : "none";

        const emptyTitle = emptyState.querySelector("h3");
        const emptyDescription = emptyState.querySelector("p");

        if (filteredUsers.length === 0) {
            if (emptyTitle) {
                emptyTitle.textContent = searchTerm
                    ? "No Matching Users"
                    : "No Online Users";
            }

            if (emptyDescription) {
                emptyDescription.textContent = searchTerm
                    ? "No active sessions match your search."
                    : "There are currently no active web sessions.";
            }
        }
    }

    async function loadOnlineUsers() {
        const currentRequest = ++requestNumber;

        refreshButton.disabled = true;
        message.textContent = "Loading active web sessions...";

        try {
            const response = await fetch("/api/online-users", {
                method: "GET",
                credentials: "same-origin",
                cache: "no-store",
                headers: {
                    Accept: "application/json"
                }
            });

            const result = await response.json().catch(() => null);

            if (!response.ok || result?.success !== true) {
                throw new Error(
                    result?.message ||
                    `Unable to load online users (HTTP ${response.status}).`
                );
            }

            if (currentRequest !== requestNumber) {
                return;
            }

            onlineUsers = Array.isArray(result.data)
                ? result.data
                : [];

            updateSummary(result.summary || {});
            renderUsers();

            message.textContent =
                `Loaded ${onlineUsers.length} active web session(s).`;
        } catch (error) {
            if (currentRequest !== requestNumber) {
                return;
            }

            console.error("Online users loading failed:", error);

            onlineUsers = [];
            updateSummary({
                totalOnline: 0,
                staffOnline: 0,
                administratorOnline: 0,
                otherRolesOnline: 0
            });

            tableBody.replaceChildren();
            visibleOnlineCount.textContent = "0";
            emptyState.style.display = "block";

            const emptyTitle = emptyState.querySelector("h3");
            const emptyDescription = emptyState.querySelector("p");

            if (emptyTitle) {
                emptyTitle.textContent = "Unable to Load Online Users";
            }

            if (emptyDescription) {
                emptyDescription.textContent =
                    "Check the connection and refresh the page.";
            }

            message.textContent =
                error.message || "Unable to retrieve online users.";
        } finally {
            if (currentRequest === requestNumber) {
                refreshButton.disabled = false;
            }
        }
    }

    searchInput.addEventListener("input", renderUsers);

    refreshButton.addEventListener("click", loadOnlineUsers);

    logoutButton.addEventListener("click", async () => {
        if (!confirm("Are you sure you want to logout?")) {
            return;
        }

        logoutButton.disabled = true;

        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "same-origin"
            });

            const result = await response.json().catch(() => null);

            if (!response.ok || result?.success !== true) {
                throw new Error(result?.message || "Logout failed.");
            }

            sessionStorage.clear();
            window.location.replace("/index.html");
        } catch (error) {
            console.error("Logout error:", error);
            alert("Unable to logout. Please try again.");
            logoutButton.disabled = false;
        }
    });

    loadOnlineUsers();
});
