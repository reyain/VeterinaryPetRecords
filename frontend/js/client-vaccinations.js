// =========================
// SESSION / ROLE CHECK
// =========================

const username =
    sessionStorage.getItem("demoUsername");

const role =
    sessionStorage.getItem("demoRole");


const allowedRoles = ["Front Desk", "Veterinarian", "Staff"];


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

const displayName =
    username
        ? username.charAt(0).toUpperCase()
          + username.slice(1)
        : "User";


document.getElementById(
    "userName"
).textContent =
    displayName;


document.getElementById(
    "userRole"
).textContent =
    role || "Staff";


document.getElementById(
    "userAvatar"
).textContent =
    displayName.charAt(0).toUpperCase();


// =========================
// SIDEBAR
// =========================

const sidebar =
    document.getElementById(
        "clientSidebar"
    );

const menuButton =
    document.getElementById(
        "menuButton"
    );


if (menuButton) {

    menuButton.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );

        }
    );

}


// =========================
// LOGOUT
// =========================

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


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


/// =========================
// API / DATABASE DATA
// =========================

const API_BASE_URL = "/api";

function showVaccinationMessage(message, backgroundColor = "#2a9d8f") {
    let toast = document.getElementById("vaccinationMessageToast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "vaccinationMessageToast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");

        Object.assign(toast.style, {
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: "99999",
            padding: "14px 20px",
            borderRadius: "10px",
            color: "#ffffff",
            fontSize: "14px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            maxWidth: "360px",
            overflowWrap: "anywhere",
            display: "none"
        });

        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.backgroundColor = backgroundColor;
    toast.style.display = "block";

    clearTimeout(toast.hideTimer);

    toast.hideTimer = setTimeout(() => {
        toast.style.display = "none";
    }, 4000);
}


let pets = [];
let owners = [];
let vaccinations = [];
const staffNameById = new Map();



let loggedInDatabaseUserId = null;
let loggedInDatabaseUserFullName = "";


async function getLoggedInDatabaseUserId() {
    if (loggedInDatabaseUserId !== null) {
        return loggedInDatabaseUserId;
    }

    const sessionText = sessionStorage.getItem("vetCurrentUser");

    if (!sessionText) {
        throw new Error("Your login session has expired. Please log in again.");
    }

    const currentUser = JSON.parse(sessionText);

    if (!currentUser.username) {
        throw new Error("Unable to identify the logged-in staff member.");
    }

    // Map the frontend demo account to its existing database account.
    const usernameMap = {
        veterinarian: "vet"
    };

    const databaseUsername =
        usernameMap[currentUser.username.toLowerCase()] ||
        currentUser.username;

    const result = await apiRequest(
        `/users/by-username/${encodeURIComponent(databaseUsername)}`
    );

    const user = result.data;

    if (
        !user ||
        !Number(user.userID) ||
        String(user.status).toLowerCase() !== "active"
    ) {
        throw new Error(
            `No active database staff account was found for "${databaseUsername}".`
        );
    }

        loggedInDatabaseUserId = Number(user.userID);
        loggedInDatabaseUserFullName = String(
            user.fullName || user.username || ""
        );

        return loggedInDatabaseUserId;
}




// =========================
// API REQUEST HELPER
// =========================

async function apiRequest(endpoint, options = {}) {
    let response;

    try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                ...(options.headers || {}),
                ...(options.body !== undefined
                    ? { "Content-Type": "application/json" }
                    : {})
            }
        });
    } catch (error) {
        throw new Error(
            "Cannot connect to the server. Check that Node.js and the C# Bridge are running."
        );
    }

    const responseText = await response.text();
    let result = {};

    if (responseText) {
        try {
            result = JSON.parse(responseText);
        } catch {
            result = { message: responseText };
        }
    }

    if (!response.ok || result.success === false) {
        throw new Error(
            result.detail ||
            result.message ||
            result.title ||
            `Request failed with HTTP ${response.status}`
        );
    }

    return result;
}


// =========================
// EXTRACT API RECORDS
// =========================

function extractRecords(result, collectionName) {
    if (Array.isArray(result)) {
        return result;
    }

    if (Array.isArray(result?.data)) {
        return result.data;
    }

    if (Array.isArray(result?.[collectionName])) {
        return result[collectionName];
    }

    return [];
}


// =========================
// NORMALIZE DATES
// =========================

function dateOnly(value) {
    if (!value) {
        return "";
    }

    return String(value).substring(0, 10);
}


// =========================
// NORMALIZE PETS
// =========================

function normalizePet(pet) {
    return {
        petId: String(
            pet.petID ?? pet.petId ?? pet.PetID ?? ""
        ),

        ownerId: String(
            pet.ownerID ?? pet.ownerId ?? pet.OwnerID ?? ""
        ),

        petName: pet.petName ?? pet.PetName ?? "",
        species: pet.species ?? pet.Species ?? "",
        breed: pet.breed ?? pet.Breed ?? "",
        sex: pet.sex ?? pet.Sex ?? "",

        birthDate: dateOnly(
            pet.birthDate ?? pet.BirthDate
        ),

        color: pet.color ?? pet.Color ?? "Not specified",
        status: pet.status ?? pet.Status ?? "Active"
    };
}


// =========================
// NORMALIZE OWNERS
// =========================

function normalizeOwner(owner) {
    return {
        ownerId: String(
            owner.ownerID ??
            owner.ownerId ??
            owner.OwnerID ??
            ""
        ),

        firstName: owner.firstName ?? owner.FirstName ?? "",
        middleName: owner.middleName ?? owner.MiddleName ?? "",
        lastName: owner.lastName ?? owner.LastName ?? "",

        nameExtension:
            owner.nameExtension ??
            owner.NameExtension ??
            owner.extension ??
            ""
    };
}


// =========================
// NORMALIZE VACCINATIONS
// =========================

function normalizeVaccination(vaccination) {
    const userId = Number(
        vaccination.userID ??
        vaccination.userId ??
        vaccination.UserID ??
        0
    );

    return {
        vaccinationId: String(
            vaccination.vaccinationID ??
            vaccination.vaccinationId ??
            vaccination.VaccinationID ??
            ""
        ),

        petId: String(
            vaccination.petID ??
            vaccination.petId ??
            vaccination.PetID ??
            ""
        ),

        userId: userId,

        vaccineName:
            vaccination.vaccineName ??
            vaccination.VaccineName ??
            "",

        dateGiven: dateOnly(
            vaccination.dateAdministered ??
            vaccination.dateGiven ??
            vaccination.DateAdministered
        ),

        nextDueDate: dateOnly(
            vaccination.nextVaccinationDate ??
            vaccination.nextDueDate ??
            vaccination.NextVaccinationDate
        ),

        // The current database model stores UserID,
        // not a separate veterinarian-name field.
        veterinarian:
            vaccination.veterinarian ??
            vaccination.Veterinarian ??
            (userId > 0
                ? `Staff ID ${userId}`
                : "Unknown Staff"),

        remarks:
            vaccination.remarks ??
            vaccination.Remarks ??
            ""
    };
}


// =========================
// LOAD PETS FROM DATABASE
// =========================

async function loadPetsFromApi() {
    const result = await apiRequest("/pets");

    pets = extractRecords(result, "pets")
        .map(normalizePet);
}


// =========================
// LOAD OWNERS FROM DATABASE
// =========================

async function loadOwnersFromApi() {
    const result = await apiRequest("/owners");

    owners = extractRecords(result, "owners")
        .map(normalizeOwner);
}


// =========================
// LOAD VACCINATIONS FROM DATABASE
// =========================


async function loadVaccinationsFromApi() {
    const result = await apiRequest("/vaccinations");

    const records = extractRecords(result, "vaccinations");

    const normalizedRecords = records.map(normalizeVaccination);

    // Get each distinct staff UserID from the vaccination records.
    const userIds = [
        ...new Set(
            normalizedRecords
                .map(vaccination => Number(vaccination.userId))
                .filter(userId => userId > 0)
        )
    ];

    // Retrieve the actual staff name for each UserID.
    await Promise.all(
        userIds.map(async userId => {
            try {
                const userResult = await apiRequest(
                    `/users/by-id/${encodeURIComponent(userId)}`
                );

                const user = userResult.data;

                staffNameById.set(
                    userId,
                    user?.fullName ||
                    user?.username ||
                    `Staff ID ${userId}`
                );
            } catch (error) {
                console.warn(
                    `Could not retrieve staff name for UserID ${userId}:`,
                    error.message
                );

                // Keep the vaccination page usable if a staff lookup fails.
                staffNameById.set(userId, `Staff ID ${userId}`);
            }
        })
    );

    // Attach the resolved staff name to every vaccination record.
    vaccinations = normalizedRecords.map(vaccination => ({
        ...vaccination,
        veterinarian:
            staffNameById.get(Number(vaccination.userId)) ||
            vaccination.veterinarian
    }));
}



// =========================
// ELEMENTS
// =========================

const vaccinationTableBody =
    document.getElementById(
        "vaccinationTableBody"
    );

const vaccinationEmptyState =
    document.getElementById(
        "vaccinationEmptyState"
    );

const vaccinationSearch =
    document.getElementById(
        "vaccinationSearch"
    );
const vaccinationPetFilter = document.getElementById("vaccinationPetFilter");
const vaccinationStatusFilter = document.getElementById("vaccinationStatusFilter");


const totalVaccinationCount =
    document.getElementById(
        "totalVaccinationCount"
    );

const dueSoonCount =
    document.getElementById(
        "dueSoonCount"
    );

    const dueTodayCount =
    document.getElementById("dueTodayCount");

const overdueCount =
    document.getElementById(
        "overdueCount"
    );

const visibleVaccinationCount =
    document.getElementById(
        "visibleVaccinationCount"
    );


// =========================
// MODAL
// =========================

const vaccinationModal =
    document.getElementById(
        "vaccinationModal"
    );

const vaccinationForm =
    document.getElementById(
        "vaccinationForm"
    );

const modalTitle =
    document.getElementById(
        "modalTitle"
    );

const addVaccinationButton =
    document.getElementById(
        "addVaccinationButton"
    );

const closeVaccinationModal =
    document.getElementById(
        "closeVaccinationModal"
    );

const cancelVaccinationButton =
    document.getElementById(
        "cancelVaccinationButton"
    );

const saveVaccinationButton =
    document.getElementById(
        "saveVaccinationButton"
    );

const vaccinationFormMessage =
    document.getElementById(
        "vaccinationFormMessage"
    );


// =========================
// FORM FIELDS
// =========================

const vaccinationPet =
    document.getElementById(
        "vaccinationPet"
    );

const vaccineName =
    document.getElementById(
        "vaccineName"
    );

const dateGiven =
    document.getElementById(
        "dateGiven"
    );

const nextDueDate =
    document.getElementById(
        "nextDueDate"
    );

const vaccinationVeterinarian =
    document.getElementById(
        "vaccinationVeterinarian"
    );

const vaccinationRemarks =
    document.getElementById(
        "vaccinationRemarks"
    );

const statusPreview =
    document.getElementById(
        "statusPreview"
    );


// =========================
// EDIT MODE
// =========================

let editingVaccinationId =
    null;


// =========================
// GET PET
// =========================

function getPet(petId) {
    return pets.find(
        pet => String(pet.petId) === String(petId)
    );
}


// =========================
// GET OWNER NAME
// =========================
function getOwnerNameFromPet(pet) {
    if (!pet) {
        return "Unknown Owner";
    }

    const owner = owners.find(
        item => String(item.ownerId) === String(pet.ownerId)
    );

    if (!owner) {
        return "Unknown Owner";
    }

    let fullName = [
        owner.firstName,
        owner.middleName,
        owner.lastName
    ]
        .filter(Boolean)
        .join(" ");

    if (owner.nameExtension) {
        fullName += `, ${owner.nameExtension}`;
    }

    return fullName || "Unknown Owner";
}


// =========================
// SAVE
// =========================

function saveVaccinations() {

    localStorage.setItem(
        VACCINATION_STORAGE_KEY,
        JSON.stringify(
            vaccinations
        )
    );

}


// =========================
// GENERATE ID
// =========================

function generateVaccinationId() {

    if (
        vaccinations.length === 0
    ) {

        return "VAC-0001";

    }


    const highestNumber =
        vaccinations.reduce(
            (
                highest,
                vaccination
            ) => {

                const number =
                    parseInt(
                        vaccination.vaccinationId
                            .replace(
                                "VAC-",
                                ""
                            ),
                        10
                    );


                if (
                    Number.isNaN(
                        number
                    )
                ) {

                    return highest;

                }


                return Math.max(
                    highest,
                    number
                );

            },
            0
        );


    return `VAC-${String(
        highestNumber + 1
    ).padStart(
        4,
        "0"
    )}`;

}


// =========================
// HTML ESCAPE
// =========================

function escapeHtml(
    value
) {

    return String(value)
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


// =========================
// DATE STATUS
// =========================


function calculateVaccinationStatus(dueDate) {
    if (!dueDate) return "No Due Date Set";

    const dateText = String(dueDate).substring(0, 10);
    const parts = dateText.split("-").map(Number);

    if (
        parts.length !== 3 ||
        !parts[0] ||
        !parts[1] ||
        !parts[2]
    ) {
        return "No Due Date Set";
    }

    const [year, month, day] = parts;
    const dueTime = Date.UTC(year, month - 1, day);

    const now = new Date();
    const todayTime = Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const days = Math.round(
        (dueTime - todayTime) / 86400000
    );

    if (days < 0) return "Overdue";
    if (days === 0) return "Due Today";
    if (days <= 30) return "Due Soon";

    return "Up to Date";
}




// =========================
// STATUS CLASS
// =========================


function applyStatusClass(element, status) {
    element.classList.remove(
        "up-to-date-status",
        "due-soon-status",
        "due-today-status",
        "overdue-status",
        "no-due-date-status"
    );

    if (status === "Up to Date") {
        element.classList.add("up-to-date-status");
    } else if (status === "Due Today") {
        element.classList.add("due-today-status");
    } else if (status === "Due Soon") {
        element.classList.add("due-soon-status");
    } else if (status === "Overdue") {
        element.classList.add("overdue-status");
    } else if (status === "No Due Date Set") {
        element.classList.add("no-due-date-status");
    }
}


// =========================
// UPDATE PREVIEW
// =========================

function updateStatusPreview() {
    const status = calculateVaccinationStatus(nextDueDate.value);

    statusPreview.textContent = status;

    statusPreview.classList.remove(
        "preview-up-to-date",
        "preview-due-soon",
        "preview-due-today",
        "preview-overdue",
        "preview-no-due-date"
    );

    if (status === "Up to Date") {
        statusPreview.classList.add("preview-up-to-date");
    } else if (status === "Due Today") {
        statusPreview.classList.add("preview-due-today");
    } else if (status === "Due Soon") {
        statusPreview.classList.add("preview-due-soon");
    } else if (status === "Overdue") {
        statusPreview.classList.add("preview-overdue");
    } else if (status === "No Due Date Set") {
        statusPreview.classList.add("preview-no-due-date");
    }
}



// =========================
// POPULATE PET DROPDOWN
// =========================
// =========================
// POPULATE PET DROPDOWN
// =========================

function populatePetDropdown(selectedPetId = "") {
    if (!vaccinationPet) {
        return;
    }

    // Use the pets already loaded from the API.
    vaccinationPet.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select Pet";
    vaccinationPet.appendChild(defaultOption);

    pets.forEach((pet) => {
        const option = document.createElement("option");

        option.value = String(pet.petId);
        option.textContent = pet.petName || `Pet ${pet.petId}`;

        if (String(pet.petId) === String(selectedPetId)) {
            option.selected = true;
        }

        vaccinationPet.appendChild(option);
    });
}


// =========================
// PET ICON
// =========================

function getPetIcon(
    pet
) {

    if (!pet) {

        return "🐾";

    }


    switch (
        pet.species
    ) {

        case "Dog":
            return "🐕";

        case "Cat":
            return "🐈";

        case "Bird":
            return "🐦";

        case "Rabbit":
            return "🐇";

        default:
            return "🐾";

    }

}


// =========================
// RENDER
// =========================

function renderVaccinations() {
    const searchValue = vaccinationSearch.value
        .toLowerCase()
        .trim();

    const selectedPetId = vaccinationPetFilter
        ? vaccinationPetFilter.value
        : "";

    const selectedStatus = vaccinationStatusFilter
        ? vaccinationStatusFilter.value
        : "";

    vaccinationTableBody.innerHTML = "";

    const filteredVaccinations = vaccinations.filter(
        (vaccination) => {
            const pet = getPet(vaccination.petId);

            const petName = pet
                ? pet.petName
                : "Unknown Pet";

            const ownerName = getOwnerNameFromPet(pet);

            const status = calculateVaccinationStatus(
                vaccination.nextDueDate
            );

            const searchableText = [
                vaccination.vaccinationId,
                petName,
                ownerName,
                vaccination.vaccineName,
                vaccination.dateGiven,
                vaccination.nextDueDate,
                vaccination.veterinarian,
                vaccination.remarks,
                status
            ]
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                searchableText.includes(searchValue);

            const matchesPet =
                !selectedPetId ||
                String(vaccination.petId) === selectedPetId;

            const matchesStatus =
                !selectedStatus ||
                status === selectedStatus;

            return (
                matchesSearch &&
                matchesPet &&
                matchesStatus
            );
        }
    );

    filteredVaccinations.forEach((vaccination) => {
        const pet = getPet(vaccination.petId);

        const petName = pet
            ? pet.petName
            : "Unknown Pet";

        const ownerName = getOwnerNameFromPet(pet);

        const status = calculateVaccinationStatus(
            vaccination.nextDueDate
        );

        const row = document.createElement("tr");
        const icon = getPetIcon(pet);

        row.innerHTML = `
            <td>
                ${escapeHtml(vaccination.vaccinationId)}
            </td>

            <td>
                <div class="vaccination-pet-cell">
                    <div class="vaccination-pet-avatar">
                        ${icon}
                    </div>
                    <div>
                        <strong>${escapeHtml(petName)}</strong>
                        <small>${escapeHtml(vaccination.petId)}</small>
                    </div>
                </div>
            </td>

            <td>${escapeHtml(ownerName)}</td>
            <td>${escapeHtml(vaccination.vaccineName)}</td>
            <td>${escapeHtml(vaccination.dateGiven)}</td>
            <td>${escapeHtml(vaccination.nextDueDate || "—")}</td>
            <td>${escapeHtml(vaccination.veterinarian)}</td>

            <td>
                <span class="vaccination-status">
                    ${escapeHtml(status)}
                </span>
            </td>

            <td>
                <div class="vaccination-actions">
                    <button
                        type="button"
                        class="vaccination-action vaccination-view-action"
                        data-action="view"
                        data-id="${escapeHtml(vaccination.vaccinationId)}"
                        title="View vaccination"
                    >👁</button>

                    <button
                        type="button"
                        class="vaccination-action vaccination-edit-action"
                        data-action="edit"
                        data-id="${escapeHtml(vaccination.vaccinationId)}"
                        title="Edit vaccination"
                    >✎</button>

                    <button
                        type="button"
                        class="vaccination-action vaccination-delete-action"
                        data-action="delete"
                        data-id="${escapeHtml(vaccination.vaccinationId)}"
                        title="Delete vaccination"
                    >🗑</button>
                </div>
            </td>
        `;

        const statusElement = row.querySelector(
            ".vaccination-status"
        );

        applyStatusClass(statusElement, status);

        vaccinationTableBody.appendChild(row);
    });

    vaccinationEmptyState.style.display =
        filteredVaccinations.length === 0
            ? "block"
            : "none";

    visibleVaccinationCount.textContent =
        filteredVaccinations.length;

    updateSummary();
}



// =========================
// SUMMARY
// =========================

function updateSummary() {

let dueSoon = 0;
let dueToday = 0;
let overdue = 0;


    
    
function updateSummary() {
    let dueSoon = 0;
    let dueToday = 0;
    let overdue = 0;

    vaccinations.forEach((vaccination) => {
        const status = calculateVaccinationStatus(
            vaccination.nextDueDate
        );

        if (status === "Due Soon") dueSoon++;
        if (status === "Due Today") dueToday++;
        if (status === "Overdue") overdue++;
    });

    totalVaccinationCount.textContent = vaccinations.length;
    dueSoonCount.textContent = dueSoon;
    dueTodayCount.textContent = dueToday;
    overdueCount.textContent = overdue;
}



    totalVaccinationCount.textContent =
        vaccinations.length;


    dueSoonCount.textContent =
        dueSoon;
        
    dueTodayCount.textContent = dueToday;


    overdueCount.textContent =
        overdue;

}


// =========================
// OPEN ADD MODAL
// =========================

async function openAddVaccinationModal() {

    editingVaccinationId =
        null;


    modalTitle.textContent =
        "Add Vaccination Record";


    saveVaccinationButton.textContent =
        "Save Vaccination";


    vaccinationForm.reset();

    vaccinationVeterinarian.readOnly = true;
    vaccinationVeterinarian.value = "";

    try {
        await getLoggedInDatabaseUserId();

        vaccinationVeterinarian.value =
            loggedInDatabaseUserFullName;
    } catch (error) {
        console.error("Unable to load the veterinarian account:", error);

        showVaccinationMessage(
            error.message || "Unable to load the veterinarian account.",
            "#c0392b"
        );

        return;
    }

    populatePetDropdown();


    /*
        Default Date Given to today.
    */

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    dateGiven.value =
        `${year}-${month}-${day}`;


    nextDueDate.min =
        dateGiven.value;


    updateStatusPreview();


    vaccinationFormMessage.textContent =
        "";


    vaccinationFormMessage.style.color =
        "";


    vaccinationModal.classList.add(
        "show"
    );


    vaccinationPet.focus();

}


// =========================
// OPEN EDIT MODAL
// =========================

function openEditVaccinationModal(
    vaccination
) {

    editingVaccinationId =
        vaccination.vaccinationId;


    modalTitle.textContent =
        "Edit Vaccination Record";


    saveVaccinationButton.textContent =
        "Update Vaccination";


    populatePetDropdown(
        vaccination.petId
    );


    vaccinationPet.value =
        vaccination.petId;


    vaccineName.value =
        vaccination.vaccineName;


    dateGiven.value =
        vaccination.dateGiven;


    nextDueDate.value =
        vaccination.nextDueDate;


    vaccinationVeterinarian.readOnly = true;

    vaccinationVeterinarian.value =
        vaccination.veterinarian ||
        `Staff ID ${vaccination.userId}`;


    vaccinationRemarks.value =
        vaccination.remarks || "";


    if (
        vaccination.dateGiven
    ) {

        nextDueDate.min =
            vaccination.dateGiven;

    }


    updateStatusPreview();


    vaccinationFormMessage.textContent =
        "";


    vaccinationFormMessage.style.color =
        "";


    vaccinationModal.classList.add(
        "show"
    );


    vaccinationPet.focus();

}


// =========================
// CLOSE
// =========================

function closeVaccinationDialog() {

    vaccinationModal.classList.remove(
        "show"
    );


    vaccinationForm.reset();


    editingVaccinationId =
        null;


    vaccinationFormMessage.textContent =
        "";


    vaccinationFormMessage.style.color =
        "";

}


// =========================
// MODAL EVENTS
// =========================

addVaccinationButton.addEventListener(
    "click",
    openAddVaccinationModal
);


closeVaccinationModal.addEventListener(
    "click",
    closeVaccinationDialog
);


cancelVaccinationButton.addEventListener(
    "click",
    closeVaccinationDialog
);


vaccinationModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            vaccinationModal
        ) {

            closeVaccinationDialog();

        }

    }
);


// =========================
// DATE EVENTS
// =========================

dateGiven.addEventListener(
    "change",
    () => {

        if (
            dateGiven.value
        ) {

            nextDueDate.min =
                dateGiven.value;


            if (
                nextDueDate.value &&
                nextDueDate.value <
                dateGiven.value
            ) {

                nextDueDate.value =
                    "";

            }

        }


        updateStatusPreview();

    }
);


nextDueDate.addEventListener(
    "change",
    updateStatusPreview
);


// =========================
// FORM SUBMIT
// =========================

vaccinationForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = {
        petId: vaccinationPet.value,
        vaccineName: vaccineName.value.trim(),
        dateGiven: dateGiven.value,
        nextDueDate: nextDueDate.value,
        veterinarian: vaccinationVeterinarian.value.trim(),
        remarks: vaccinationRemarks.value.trim()
    };

    if (!formData.petId) {
        showVaccinationMessage("Please select a pet.", "#c0392b");
        return;
    }

    if (!formData.vaccineName) {
        showVaccinationMessage("Vaccine name is required.", "#c0392b");
        return;
    }

    if (!formData.dateGiven) {
        showVaccinationMessage("Date given is required.", "#c0392b");
        return;
    }

    if (formData.nextDueDate < formData.dateGiven) {
        showVaccinationMessage(
            "Next due date cannot be earlier than the date given.",
            "#c0392b"
        );
        return;
    }

    if (!formData.veterinarian) {
        showVaccinationMessage("Veterinarian name is required.", "#c0392b");
        return;
    }

    try {
        const existingVaccination = editingVaccinationId
            ? vaccinations.find(
                item =>
                    String(item.vaccinationId) ===
                    String(editingVaccinationId)
            )
            : null;

        if (editingVaccinationId && !existingVaccination) {
            throw new Error("Vaccination record could not be found.");
        }

        const userId = editingVaccinationId
            ? Number(existingVaccination.userId)
            : await getLoggedInDatabaseUserId();

        if (!Number.isInteger(userId) || userId <= 0) {
            throw new Error("A valid staff account is required.");
        }

        const payload = {
            petID: Number(formData.petId),
            userID: userId,
            vaccineName: formData.vaccineName,
            dateAdministered: formData.dateGiven,
            nextVaccinationDate: formData.nextDueDate,
            remarks: formData.remarks || null
        };


        if (editingVaccinationId) {
            await apiRequest(
                `/vaccinations/${encodeURIComponent(editingVaccinationId)}`,
                {
                    method: "PUT",
                    body: JSON.stringify(payload)
                }
            );

            showVaccinationMessage(
                "Vaccination record updated successfully.",
                "#2a9d8f"
            );
        } else {
            await apiRequest("/vaccinations", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            showVaccinationMessage(
                "Vaccination record added successfully.",
                "#2a9d8f"
            );
        }

        await loadVaccinationsFromApi();
        renderVaccinations();

        setTimeout(closeVaccinationDialog, 600);
    } catch (error) {
        console.error("Unable to save vaccination record:", error);

        showVaccinationMessage(
            error.message || "Unable to save vaccination record.",
            "#c0392b"
        );
    }
});

// =========================
// TABLE ACTIONS
// =========================

vaccinationTableBody.addEventListener(
    "click",
    async (event) => {

        const button =
            event.target.closest(
                ".vaccination-action"
            );


        if (!button) {
            return;
        }


        const vaccinationId =
            button.dataset.id;


        const action =
            button.dataset.action;


        const vaccination =
            vaccinations.find(
                item =>
                    item.vaccinationId ===
                    vaccinationId
            );


        if (!vaccination) {
            return;
        }


        const pet =
            getPet(
                vaccination.petId
            );


        const petName =
            pet
                ? pet.petName
                : "Unknown Pet";


        const ownerName =
            getOwnerNameFromPet(
                pet
            );


        const status =
            calculateVaccinationStatus(
                vaccination.nextDueDate
            );


        // =========================
        // VIEW
        // =========================

       
        
        if (action === "view") {
            showVaccinationDetails(vaccination, petName, ownerName, status);
            return;
        }




        // =========================
        // EDIT
        // =========================

        if (
            action === "edit"
        ) {

            openEditVaccinationModal(
                vaccination
            );


            return;

        }


        // =========================
        // DELETE
        // =========================

                
        if (action === "delete") {
            const confirmed = confirm(
                `Delete this vaccination record?\n\n` +
                `Pet: ${petName}\n` +
                `Vaccine: ${vaccination.vaccineName}`
            );

            if (!confirmed) {
                return;
            }

            try {
                await apiRequest(
                    `/vaccinations/${encodeURIComponent(vaccination.vaccinationId)}`,
                    { method: "DELETE" }
                );

                await loadVaccinationsFromApi();
                renderVaccinations();

                showVaccinationMessage(
                    "Vaccination record deleted successfully.",
                    "#2a9d8f"
                );
            } catch (error) {
                console.error("Unable to delete vaccination record:", error);

                showVaccinationMessage(
                    error.message || "Unable to delete vaccination record.",
                    "#c0392b"
                );
            }
        }

    }
);


// =========================
// SEARCH
// =========================

vaccinationSearch.addEventListener(
    "input",
    renderVaccinations
);

vaccinationPetFilter.addEventListener("change", renderVaccinations);

vaccinationStatusFilter.addEventListener("change", renderVaccinations);




// =========================
// INITIALIZE FROM DATABASE
// =========================

async function initializeVaccinationPage() {
    try {
        await Promise.all([
            loadPetsFromApi(),
            loadOwnersFromApi(),
            loadVaccinationsFromApi()
        ]);
        populateVaccinationPetFilter();

        populatePetDropdown();
        renderVaccinations();

        console.log("Vaccination page loaded from the database.");
        console.log("Pets:", pets.length);
        console.log("Owners:", owners.length);
        console.log("Vaccinations:", vaccinations.length);

    } catch (error) {
        console.error(
            "Unable to initialize vaccination page:",
            error
        );

        vaccinationEmptyState.style.display = "block";
        vaccinationEmptyState.textContent =
            `Unable to load vaccination records: ${error.message}`;

        vaccinationTableBody.innerHTML = "";
    }
}

initializeVaccinationPage();


function populateVaccinationPetFilter() {
    if (!vaccinationPetFilter) return;

    const selectedPetId = vaccinationPetFilter.value;

    vaccinationPetFilter.innerHTML =
        '<option value="">All Pets</option>';

    pets.forEach((pet) => {
        const option = document.createElement("option");

        option.value = String(pet.petId);
        option.textContent = pet.petName;

        vaccinationPetFilter.appendChild(option);
    });

    const petStillExists = Array.from(
        vaccinationPetFilter.options
    ).some((option) => option.value === selectedPetId);

    if (petStillExists) {
        vaccinationPetFilter.value = selectedPetId;
    }
}


const vaccinationViewModal = document.getElementById("vaccinationViewModal");
// Keep the modal outside the page layout so it centers in the viewport.
if (vaccinationViewModal && vaccinationViewModal.parentElement !== document.body) {
    document.body.appendChild(vaccinationViewModal);
}
const vaccinationViewDetails = document.getElementById("vaccinationViewDetails");
const closeVaccinationView = document.getElementById("closeVaccinationView");
const closeVaccinationViewFooter = document.getElementById("closeVaccinationViewFooter");

function closeVaccinationViewModal() {
    vaccinationViewModal.style.display = "none";
}

closeVaccinationView.addEventListener(
    "click",
    closeVaccinationViewModal
);

closeVaccinationViewFooter.addEventListener(
    "click",
    closeVaccinationViewModal
);

vaccinationViewModal.addEventListener("click", (event) => {
    if (event.target === vaccinationViewModal) {
        closeVaccinationViewModal();
    }
});

function showVaccinationDetails(vaccination, petName, ownerName, status) {
    const details = [
        ["Vaccination ID", vaccination.vaccinationId],
        ["Pet", petName],
        ["Owner", ownerName],
        ["Vaccine", vaccination.vaccineName],
        ["Date Given", vaccination.dateGiven],
        ["Next Due Date", vaccination.nextDueDate || "No due date set"],
        ["Veterinarian", vaccination.veterinarian || "Not available"],
        ["Status", status],
        ["Remarks", vaccination.remarks || "None"]
    ];

    vaccinationViewDetails.innerHTML = details.map(([label, value]) => `
        <div class="vaccination-detail-item">
            <span class="vaccination-detail-label">${escapeHtml(label)}</span>
            <span class="vaccination-detail-value">${escapeHtml(value)}</span>
        </div>
    `).join("");

    vaccinationViewModal.style.setProperty("display", "flex", "important");
}
