
/* =========================================================
   SERVER - AUDIT LOGS
   Live MySQL-backed audit log viewer
   Administrator read-only access
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

    const refreshButton = getElement("refreshAuditButton");
    const searchInput = getElement("auditSearch");
    const moduleFilter = getElement("auditModuleFilter");
    const actionFilter = getElement("auditActionFilter");
    const roleFilter = getElement("auditRoleFilter");
    const dateFilter = getElement("auditDateFilter");
    const resetButton = getElement("resetAuditButton");

    const tableBody = getElement("auditTableBody");
    const emptyState = getElement("auditEmptyState");
    const visibleAuditCount = getElement("visibleAuditCount");
    const message = getElement("auditMessage");

    const totalAuditCount = getElement("totalAuditCount");
    const todayAuditCount = getElement("todayAuditCount");
    const createAuditCount = getElement("createAuditCount");
    const updateAuditCount = getElement("updateAuditCount");
    const deleteAuditCount = getElement("deleteAuditCount");

    const administratorName =
        currentUser.fullName ||
        currentUser.username ||
        "Administrator";

    userName.textContent = administratorName;
    userRole.textContent = "Administrator";
    userAvatar.textContent =
        administratorName.trim().charAt(0).toUpperCase() || "A";

    let currentPage = 1;
    const pageSize = 25;
    let totalPages = 0;
    let totalMatchingLogs = 0;
    let requestNumber = 0;
    let searchTimer = null;

    /* =====================================================
       PAGINATION CONTROLS
       ===================================================== */

    const tablePanel = document.querySelector(".audit-table-panel");
    const pagination = document.createElement("div");
    pagination.className = "audit-pagination";
    pagination.setAttribute("aria-label", "Audit log pagination");

    const previousButton = document.createElement("button");
    previousButton.type = "button";
    previousButton.className = "audit-pagination-button";
    previousButton.textContent = "Previous";

    const pageStatus = document.createElement("span");
    pageStatus.className = "audit-pagination-status";
    pageStatus.setAttribute("aria-live", "polite");

    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "audit-pagination-button";
    nextButton.textContent = "Next";

    pagination.append(previousButton, pageStatus, nextButton);

    if (tablePanel) {
        tablePanel.insertAdjacentElement("afterend", pagination);
    }

    /* =====================================================
       HELPERS
       ===================================================== */

    function setMessage(text) {
        message.textContent = text;
    }

    function createCell(value) {
        const cell = document.createElement("td");
        cell.textContent =
            value === null || value === undefined || value === ""
                ? "—"
                : String(value);
        return cell;
    }

    function formatDateTime(value) {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return String(value);
        }

        return date.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
    }

    function updateSummary(data) {
        totalAuditCount.textContent = data.total ?? 0;
        todayAuditCount.textContent = data.today ?? 0;
        createAuditCount.textContent = data.creates ?? 0;
        updateAuditCount.textContent = data.updates ?? 0;
        deleteAuditCount.textContent = data.deletes ?? 0;
    }

    function renderPagination() {
        const displayPages = Math.max(1, totalPages);

        pageStatus.textContent =
            `Page ${currentPage} of ${displayPages} · ` +
            `${totalMatchingLogs} matching logs`;

        previousButton.disabled = currentPage <= 1;
        nextButton.disabled =
            totalPages === 0 || currentPage >= totalPages;
    }

    /* =====================================================
       RENDER DATABASE RECORDS
       ===================================================== */

    function renderLogs(logs) {
        tableBody.replaceChildren();

        for (const log of logs) {
            const row = document.createElement("tr");

            row.appendChild(createCell(log.auditID));
            row.appendChild(createCell(formatDateTime(log.createdAt)));

            const userCell = document.createElement("td");
            const name = document.createElement("strong");
            const username = document.createElement("small");

            name.textContent =
                log.fullName || log.username || `User ${log.userID}`;

            username.textContent = log.username
                ? `@${log.username}`
                : `User ID: ${log.userID}`;

            userCell.append(name, document.createElement("br"), username);
            row.appendChild(userCell);

            row.appendChild(createCell(log.role));
            row.appendChild(createCell(log.module));

            const actionCell = document.createElement("td");
            const actionBadge = document.createElement("span");

            const actionText = String(log.action || "").toUpperCase();
            actionBadge.className =
                `audit-action ${actionText.toLowerCase()}`;
            actionBadge.textContent = actionText || "—";

            actionCell.appendChild(actionBadge);
            row.appendChild(actionCell);

            row.appendChild(createCell(log.recordID));
            row.appendChild(createCell(log.description));

            tableBody.appendChild(row);
        }

        visibleAuditCount.textContent = logs.length;
        emptyState.style.display = logs.length === 0 ? "block" : "none";
    }

    /* =====================================================
       LOAD SUMMARY
       ===================================================== */

    async function loadSummary() {
        const response = await fetch("/api/audit-logs/summary", {
            method: "GET",
            credentials: "same-origin",
            cache: "no-store",
            headers: { Accept: "application/json" }
        });

        const result = await response.json().catch(() => null);

        if (!response.ok || result?.success !== true) {
            throw new Error(
                result?.message || "Unable to retrieve audit summary."
            );
        }

        updateSummary(result.data);
    }

    /* =====================================================
       BUILD FILTER QUERY
       ===================================================== */

    function buildQuery() {
        const params = new URLSearchParams();

        params.set("page", String(currentPage));
        params.set("limit", String(pageSize));

        const search = searchInput.value.trim();
        const moduleName = moduleFilter.value;
        const action = actionFilter.value;
        const selectedRole = roleFilter.value;
        const date = dateFilter.value;

        if (search) {
            params.set("search", search);
        }

        if (moduleName && moduleName !== "all") {
            params.set("module", moduleName.toLowerCase());
        }

        if (action && action !== "all") {
            params.set("action", action.toUpperCase());
        }

        if (selectedRole && selectedRole !== "all") {
            params.set("role", selectedRole.toLowerCase());
        }

        if (date) {
            params.set("date", date);
        }

        return params;
    }

    /* =====================================================
       LOAD LOGS FROM API
       ===================================================== */

    async function loadLogs(resetPage = false) {
        if (resetPage) {
            currentPage = 1;
        }

        const requestId = ++requestNumber;

        refreshButton.disabled = true;
        setMessage("Loading audit logs...");

        try {
            const query = buildQuery();

            const response = await fetch(
                `/api/audit-logs?${query.toString()}`,
                {
                    method: "GET",
                    credentials: "same-origin",
                    cache: "no-store",
                    headers: { Accept: "application/json" }
                }
            );

            const result = await response.json().catch(() => null);

            if (!response.ok || result?.success !== true) {
                throw new Error(
                    result?.message ||
                    `Unable to load audit logs (HTTP ${response.status}).`
                );
            }

            if (requestId !== requestNumber) {
                return;
            }

            const logs = Array.isArray(result.data) ? result.data : [];
            const pageInfo = result.pagination || {};

            currentPage = Number(pageInfo.page) || 1;
            totalPages = Number(pageInfo.totalPages) || 0;
            totalMatchingLogs = Number(pageInfo.total) || 0;

            renderLogs(logs);
            renderPagination();

            setMessage(
                `Loaded ${logs.length} audit logs on this page.`
            );
        } catch (error) {
            if (requestId !== requestNumber) {
                return;
            }

            console.error("Audit log loading failed:", error);

            tableBody.replaceChildren();
            visibleAuditCount.textContent = "0";
            totalMatchingLogs = 0;
            totalPages = 0;

            emptyState.style.display = "block";
            setMessage(error.message || "Unable to load audit logs.");
            renderPagination();
        } finally {
            if (requestId === requestNumber) {
                refreshButton.disabled = false;
            }
        }
    }

    /* =====================================================
       FILTER EVENTS
       ===================================================== */

    searchInput.addEventListener("input", () => {
        clearTimeout(searchTimer);

        searchTimer = setTimeout(() => {
            loadLogs(true);
        }, 300);
    });

    moduleFilter.addEventListener("change", () => loadLogs(true));
    actionFilter.addEventListener("change", () => loadLogs(true));
    roleFilter.addEventListener("change", () => loadLogs(true));
    dateFilter.addEventListener("change", () => loadLogs(true));

    resetButton.addEventListener("click", () => {
        clearTimeout(searchTimer);

        searchInput.value = "";
        moduleFilter.value = "all";
        actionFilter.value = "all";
        roleFilter.value = "all";
        dateFilter.value = "";

        loadLogs(true);
    });

    /* =====================================================
       PAGINATION EVENTS
       ===================================================== */

    previousButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage -= 1;
            loadLogs();
        }
    });

    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage += 1;
            loadLogs();
        }
    });

    /* =====================================================
       REFRESH
       ===================================================== */

    refreshButton.addEventListener("click", async () => {
        setMessage("Refreshing audit logs...");

        try {
            await loadSummary();
        } catch (error) {
            console.error("Audit summary refresh failed:", error);
        }

        await loadLogs(true);
    });

    /* =====================================================
       LOGOUT
       ===================================================== */

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

    /* =====================================================
       INITIAL LOAD
       ===================================================== */

    async function initialize() {
        try {
            await loadSummary();
        } catch (error) {
            console.error("Audit summary loading failed:", error);
            setMessage("Audit logs are loading, but summary counts are unavailable.");
        }

        await loadLogs(true);
    }

    initialize();
});
