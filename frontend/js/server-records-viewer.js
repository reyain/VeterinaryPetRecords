document.addEventListener("DOMContentLoaded", () => {
    const currentUserText = sessionStorage.getItem("vetCurrentUser");
    let currentUser = null;

    try {
        currentUser = currentUserText ? JSON.parse(currentUserText) : null;
    } catch {
        currentUser = null;
    }

    const role = String(currentUser?.role ?? "").trim().toLowerCase();

    if (!currentUser || !["admin", "administrator"].includes(role)) {
        window.location.replace("/index.html");
        return;
    }

    const userName = document.getElementById("userName");
    const userInitial = document.getElementById("userInitial");
    const logoutButton = document.getElementById("logoutButton");
    const datasetTitle = document.getElementById("datasetTitle");
    const recordCount = document.getElementById("recordCount");
    const searchInput = document.getElementById("recordSearch");
    const refreshButton = document.getElementById("refreshRecords");
    const message = document.getElementById("recordsMessage");
    const tableHead = document.getElementById("recordsTableHead");
    const tableBody = document.getElementById("recordsTableBody");
    const emptyMessage = document.getElementById("recordsEmpty");
    const tabs = Array.from(document.querySelectorAll(".records-tab"));

    const displayName = currentUser.fullName || currentUser.username || "Administrator";
        userName.textContent = displayName;
        userInitial.textContent = displayName.trim().charAt(0).toUpperCase() || "A";

    const configurations = {
        owners: {
            title: "Owners",
            endpoint: "/api/owners",
            columns: [
                ["ownerID", "Owner ID"],
                ["fullName", "Owner Name"],
                ["contactNumber", "Contact Number"],
                ["email", "Email"],
                ["address", "Address"],
                ["status", "Status"]
            ]
        },
        pets: {
            title: "Pets",
            endpoint: "/api/pets",
            columns: [
                ["petID", "Pet ID"],
                ["petName", "Pet Name"],
                ["species", "Species"],
                ["breed", "Breed"],
                ["sex", "Sex"],
                ["ownerID", "Owner ID"],
                ["status", "Status"]
            ]
        },
        medicalRecords: {
            title: "Medical Records",
            endpoint: "/api/medical-records",
            columns: [
                ["medicalRecordID", "Record ID"],
                ["petName", "Pet Name"],
                ["petID", "Pet ID"],
                ["visitDate", "Visit Date"],
                ["diagnosis", "Diagnosis"],
                ["treatment", "Treatment"],
                ["medications", "Medications"],
                ["userID", "Staff ID"]
            ]
        },
        vaccinations: {
            title: "Vaccinations",
            endpoint: "/api/vaccinations",
            columns: [
                ["vaccinationID", "Vaccination ID"],
                ["petID", "Pet ID"],
                ["vaccineName", "Vaccine"],
                ["dateAdministered", "Date Administered"],
                ["nextVaccinationDate", "Next Due Date"],
                ["userID", "Staff ID"],
                ["remarks", "Remarks"]
            ]
        }
    };

    const cache = {};
    let currentDataset = "owners";
    let requestNumber = 0;

    function displayValue(value) {
        if (value === null || value === undefined || value === "") {
            return "—";
        }

        if (typeof value === "string" && value.includes("T")) {
            return value.replace("T", " ").slice(0, 19);
        }

        return String(value);
    }

    function clearTable() {
        tableHead.replaceChildren();
        tableBody.replaceChildren();
        emptyMessage.hidden = true;
    }

    function renderRecords() {
        clearTable();

        const config = configurations[currentDataset];
        const records = cache[currentDataset] ?? [];
        const query = searchInput.value.trim().toLowerCase();

        datasetTitle.textContent = config.title;

        const filteredRecords = records.filter(record =>
            config.columns.some(([field]) =>
                displayValue(record[field]).toLowerCase().includes(query)
            )
        );

        recordCount.textContent =
            `Showing ${filteredRecords.length} of ${records.length} records`;

        const headerRow = document.createElement("tr");

        for (const [, label] of config.columns) {
            const th = document.createElement("th");
            th.scope = "col";
            th.textContent = label;
            headerRow.appendChild(th);
        }

        tableHead.appendChild(headerRow);

        for (const record of filteredRecords) {
            const row = document.createElement("tr");

            for (const [field] of config.columns) {
                const cell = document.createElement("td");
                cell.textContent = displayValue(record[field]);
                row.appendChild(cell);
            }

            tableBody.appendChild(row);
        }

        emptyMessage.hidden = filteredRecords.length > 0;

        if (records.length > 0 || filteredRecords.length === 0) {
            emptyMessage.textContent = query
                ? "No matching records were found."
                : "There are no records in this category.";
        }
    }

    async function loadDataset(datasetKey, forceRefresh = false) {
        const requestId = ++requestNumber;
        const config = configurations[datasetKey];

        message.textContent = `Loading ${config.title.toLowerCase()}...`;
        refreshButton.disabled = true;

        try {
            if (!cache[datasetKey] || forceRefresh) {
                const response = await fetch(config.endpoint, {
                    method: "GET",
                    credentials: "same-origin",
                    cache: "no-store",
                    headers: {
                        Accept: "application/json"
                    }
                });

                const result = await response.json().catch(() => null);

                if (!response.ok) {
                    throw new Error(
                        result?.message || `Request failed with HTTP ${response.status}`
                    );
                }

                if (!result || result.success !== true ||
                    !Array.isArray(result.data)) {
                    throw new Error("The API returned an unexpected response.");
                }

                cache[datasetKey] = result.data;
            }

            if (requestId !== requestNumber) {
                return;
            }

            renderRecords();
            message.textContent = `${config.title} loaded successfully.`;
        } catch (error) {
            if (requestId !== requestNumber) {
                return;
            }

            clearTable();
            recordCount.textContent = "Records unavailable";
            message.textContent =
                `Unable to load ${config.title.toLowerCase()}. ${error.message}`;

            console.error(`Records viewer: ${config.title}`, error);
        } finally {
            if (requestId === requestNumber) {
                refreshButton.disabled = false;
            }
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            currentDataset = tab.dataset.dataset;

            tabs.forEach(otherTab => {
                const selected = otherTab === tab;
                otherTab.classList.toggle("active", selected);
                otherTab.setAttribute("aria-selected", String(selected));
            });

            searchInput.value = "";
            loadDataset(currentDataset);
        });
    });

    searchInput.addEventListener("input", () => {
        if (cache[currentDataset]) {
            renderRecords();
        }
    });

    refreshButton.addEventListener("click", () => {
        loadDataset(currentDataset, true);
    });

    logoutButton.addEventListener("click", async () => {
        logoutButton.disabled = true;

        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "same-origin"
            });

            if (!response.ok) {
                throw new Error("Server logout failed.");
            }

            sessionStorage.clear();
            window.location.replace("/index.html");
        } catch (error) {
            console.error("Logout failed:", error);
            alert("Unable to complete logout. Please try again.");
            logoutButton.disabled = false;
        }
    });

    loadDataset(currentDataset);
});