
 // =========================
 // SESSION / ROLE CHECK
 // =========================

const username = sessionStorage.getItem("demoUsername");
const role = sessionStorage.getItem("demoRole");

const allowedRoles = ["Front Desk", "Veterinarian"];

if (!username || !allowedRoles.includes(role)) {
    window.location.href = "../../index.html";
}

// =========================
// USER DISPLAY
// =========================

if (username && role) {
    const displayName =
        username.charAt(0).toUpperCase() + username.slice(1);

    const userNameElement = document.getElementById("userName");
    const userRoleElement = document.getElementById("userRole");
    const userAvatarElement = document.getElementById("userAvatar");

    if (userNameElement) userNameElement.textContent = displayName;
    if (userRoleElement) userRoleElement.textContent = role;

    if (userAvatarElement) {
        userAvatarElement.textContent = displayName.charAt(0).toUpperCase();
    }
}

// =========================
// SIDEBAR
// =========================

const sidebar = document.getElementById("clientSidebar");
const menuButton = document.getElementById("menuButton");

if (menuButton && sidebar) {
    menuButton.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });
}

// =========================
// LOGOUT
// =========================

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {
            sessionStorage.clear();
            window.location.href = "../../index.html";
        }
    });
}

// =========================
// API / PET AND OWNER DATA
// =========================

const API_BASE_URL = "/api";

let pets = [];
let owners = [];
let editingPetId = null;

// =========================
// API HELPER
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
// NORMALIZE PET RESPONSE
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
        birthDate:
            pet.birthDate || pet.BirthDate
                ? String(pet.birthDate ?? pet.BirthDate).substring(0, 10)
                : "",
        color: pet.color ?? pet.Color ?? "Not specified",
        status: pet.status ?? pet.Status ?? "Active",
        createdAt: pet.createdAt ?? pet.CreatedAt ?? ""
    };
}

// =========================
// LOAD PETS FROM DATABASE
// =========================

async function loadPetsFromApi() {
    const result = await apiRequest("/pets");

    if (Array.isArray(result)) {
        pets = result.map(normalizePet);
        return;
    }

    const records = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.pets)
            ? result.pets
            : [];

    pets = records.map(normalizePet);
}

// =========================
// LOAD OWNERS FROM DATABASE
// =========================

async function loadOwnersFromApi() {
    const result = await apiRequest("/owners");

    const records = Array.isArray(result)
        ? result
        : Array.isArray(result.data)
            ? result.data
            : Array.isArray(result.owners)
                ? result.owners
                : [];

    owners = records.map(owner => ({
        ownerId: String(
            owner.ownerID ?? owner.ownerId ?? owner.OwnerID ?? ""
        ),
        firstName: owner.firstName ?? owner.FirstName ?? "",
        middleName: owner.middleName ?? owner.MiddleName ?? "",
        lastName: owner.lastName ?? owner.LastName ?? "",
        nameExtension: owner.nameExtension ?? owner.NameExtension ?? "",
        contactNumber: owner.contactNumber ?? owner.ContactNumber ?? "",
        address: owner.address ?? owner.Address ?? "",
        fullName: owner.fullName ?? owner.FullName ?? ""
    }));
}

// =========================
// PAGE ELEMENTS
// =========================

const petTableBody = document.getElementById("petTableBody");
const petEmptyState = document.getElementById("petEmptyState");
const petSearch = document.getElementById("petSearch");
const totalPetCount = document.getElementById("totalPetCount");
const activePetCount = document.getElementById("activePetCount");
const inactivePetCount = document.getElementById("inactivePetCount");
const visiblePetCount = document.getElementById("visiblePetCount");

// =========================
// MODAL ELEMENTS
// =========================

const petModal = document.getElementById("petModal");
const petForm = document.getElementById("petForm");
const modalTitle = document.getElementById("modalTitle");
const addPetButton = document.getElementById("addPetButton");
const closePetModal = document.getElementById("closePetModal");
const cancelPetButton = document.getElementById("cancelPetButton");
const savePetButton = document.getElementById("savePetButton");
const petFormMessage = document.getElementById("petFormMessage");

// =========================
// FORM FIELDS
// =========================

const petName = document.getElementById("petName");
const ownerSelect = document.getElementById("ownerSelect");
const species = document.getElementById("species");
const breed = document.getElementById("breed");
const sex = document.getElementById("sex");
const birthDate = document.getElementById("birthDate");
const registrationStatus = document.getElementById("registrationStatus");

// =========================
// OWNER HELPERS
// =========================

function getOwnerName(ownerId) {
    const owner = owners.find(
        item => String(item.ownerId) === String(ownerId)
    );

    if (!owner) return "Unknown Owner";
    if (owner.fullName) return owner.fullName;

    let fullName = [
        owner.firstName,
        owner.middleName,
        owner.lastName
    ].filter(Boolean).join(" ");

    if (owner.nameExtension) {
        fullName += ` ${owner.nameExtension}`;
    }

    return fullName || "Unknown Owner";
}

// =========================
// POPULATE OWNER DROPDOWN
// =========================

function populateOwnerDropdown(selectedOwnerId = "") {
    if (!ownerSelect) return;

    ownerSelect.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = owners.length
        ? "Select Owner"
        : "No registered owners available";

    ownerSelect.appendChild(defaultOption);

    owners.forEach(owner => {
        const option = document.createElement("option");
        option.value = String(owner.ownerId);
        option.textContent =
            `${owner.ownerId} — ${getOwnerName(owner.ownerId)}`;

        option.selected =
            String(owner.ownerId) === String(selectedOwnerId);

        ownerSelect.appendChild(option);
    });
}

// =========================
// PET ICON
// =========================

function getPetIcon(petSpecies) {
    switch (petSpecies) {
        case "Dog": return "🐕";
        case "Cat": return "🐈";
        case "Bird": return "🐦";
        case "Rabbit": return "🐇";
        default: return "🐾";
    }
}

// =========================
// HTML ESCAPE
// =========================

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// =========================
// RENDER PETS
// =========================

function renderPets() {
    if (!petTableBody || !petSearch) return;

    const searchValue = petSearch.value.toLowerCase().trim();
    petTableBody.innerHTML = "";

    const filteredPets = pets.filter(pet => {
        const searchableText = [
            pet.petId,
            pet.petName,
            getOwnerName(pet.ownerId),
            pet.species,
            pet.breed,
            pet.sex,
            pet.birthDate,
            pet.status
        ].join(" ").toLowerCase();

        return searchableText.includes(searchValue);
    });

    filteredPets.forEach(pet => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(pet.petId)}</td>
            <td>
                <div class="pet-name-cell">
                    <div class="pet-avatar">${getPetIcon(pet.species)}</div>
                    <div>
                        <strong>${escapeHtml(pet.petName)}</strong>
                        <small>Registered Pet</small>
                    </div>
                </div>
            </td>
            <td>${escapeHtml(getOwnerName(pet.ownerId))}</td>
            <td>${escapeHtml(pet.species)}</td>
            <td>${escapeHtml(pet.breed)}</td>
            <td>${escapeHtml(pet.sex)}</td>
            <td>${escapeHtml(pet.birthDate || "—")}</td>
            <td>
                <span class="pet-status ${
                    pet.status === "Active"
                        ? "pet-active-status"
                        : "pet-inactive-status"
                }">${escapeHtml(pet.status)}</span>
            </td>
            <td>
                <div class="pet-actions">
                    <button type="button" class="pet-action pet-view-action"
                        data-action="view" data-id="${escapeHtml(pet.petId)}"
                        title="View pet">👁</button>
                    <button type="button" class="pet-action pet-edit-action"
                        data-action="edit" data-id="${escapeHtml(pet.petId)}"
                        title="Edit pet">✎</button>
                    <button type="button" class="pet-action pet-delete-action"
                        data-action="delete" data-id="${escapeHtml(pet.petId)}"
                        title="Delete pet">🗑</button>
                </div>
            </td>
        `;

        petTableBody.appendChild(row);
    });

    if (petEmptyState) {
        petEmptyState.textContent = filteredPets.length === 0
            ? (searchValue
                ? "No pets match your search."
                : "No pet records found.")
            : "";

        petEmptyState.style.display =
            filteredPets.length === 0 ? "block" : "none";
    }

    if (visiblePetCount) {
        visiblePetCount.textContent = String(filteredPets.length);
    }

    updateSummary();
}

// =========================
// SUMMARY COUNTS
// =========================

function updateSummary() {
    const total = pets.length;
    const active = pets.filter(pet => pet.status === "Active").length;
    const inactive = pets.filter(pet => pet.status === "Inactive").length;

    if (totalPetCount) totalPetCount.textContent = String(total);
    if (activePetCount) activePetCount.textContent = String(active);
    if (inactivePetCount) inactivePetCount.textContent = String(inactive);
}

// =========================
// FORM MESSAGES
// =========================

function showFormMessage(message, color = "") {
    if (!petFormMessage) return;

    petFormMessage.textContent = message;
    petFormMessage.style.color = color;
}

// =========================
// OPEN ADD PET MODAL
// =========================

function openAddPetModal() {
    editingPetId = null;

    if (modalTitle) modalTitle.textContent = "Register New Pet";
    if (savePetButton) savePetButton.textContent = "Register Pet";
    if (petForm) petForm.reset();
    if (registrationStatus) registrationStatus.value = "Active";

    populateOwnerDropdown();
    showFormMessage("");

    if (petModal) petModal.classList.add("show");
    if (petName) petName.focus();
}

// =========================
// OPEN EDIT PET MODAL
// =========================

function openEditPetModal(pet) {
    editingPetId = String(pet.petId);

    if (modalTitle) modalTitle.textContent = "Edit Pet";
    if (savePetButton) savePetButton.textContent = "Update Pet";

    populateOwnerDropdown(pet.ownerId);

    if (petName) petName.value = pet.petName;
    if (ownerSelect) ownerSelect.value = String(pet.ownerId);
    if (species) species.value = pet.species;
    if (breed) breed.value = pet.breed;
    if (sex) sex.value = pet.sex;
    if (birthDate) birthDate.value = pet.birthDate || "";
    if (registrationStatus) registrationStatus.value = pet.status;

    showFormMessage("");

    if (petModal) petModal.classList.add("show");
    if (petName) petName.focus();
}

// =========================
// CLOSE MODAL
// =========================

function closePetDialog() {
    if (petModal) petModal.classList.remove("show");
    if (petForm) petForm.reset();

    editingPetId = null;
    showFormMessage("");
}

// =========================
// OPEN / CLOSE EVENTS
// =========================

if (addPetButton) {
    addPetButton.addEventListener("click", openAddPetModal);
}

if (closePetModal) {
    closePetModal.addEventListener("click", closePetDialog);
}

if (cancelPetButton) {
    cancelPetButton.addEventListener("click", closePetDialog);
}

if (petModal) {
    petModal.addEventListener("click", event => {
        if (event.target === petModal) closePetDialog();
    });
}

// =========================
// FORM VALIDATION
// =========================

function validatePet(pet) {
    if (!pet.petName) return "Pet name is required.";
    if (!pet.ownerId) return "Please select an owner.";
    if (!pet.species) return "Please select the pet species.";
    if (!pet.breed) return "Breed is required.";
    if (!pet.sex) return "Please select the pet's sex.";

    if (!Number.isInteger(Number(pet.ownerId)) || Number(pet.ownerId) <= 0) {
        return "Please select a valid owner.";
    }

    return null;
}

// =========================
// GET FORM DATA
// =========================

function getPetFormData() {
    return {
        petName: petName ? petName.value.trim() : "",
        ownerId: ownerSelect ? ownerSelect.value : "",
        species: species ? species.value : "",
        breed: breed ? breed.value.trim() : "",
        sex: sex ? sex.value : "",
        birthDate: birthDate ? birthDate.value : "",
        status: registrationStatus ? registrationStatus.value : "Active"
    };
}

// =========================
// SAVE: CREATE OR UPDATE VIA API
// =========================

if (petForm) {
    petForm.addEventListener("submit", async event => {
        event.preventDefault();

        const formData = getPetFormData();
        const validationError = validatePet(formData);

        if (validationError) {
            showFormMessage(validationError, "#c0392b");
            return;
        }

        const isEditing = editingPetId !== null && editingPetId !== "";
        const originalButtonText = savePetButton
            ? savePetButton.textContent
            : "Save";

        if (savePetButton) {
            savePetButton.disabled = true;
            savePetButton.textContent = isEditing
                ? "Updating..."
                : "Registering...";
        }

        const payload = {
            ownerID: Number(formData.ownerId),
            petName: formData.petName,
            species: formData.species,
            breed: formData.breed,
            sex: formData.sex,
            birthDate: formData.birthDate || null,
            color: "Not specified",
            status: formData.status
        };

        try {
            if (isEditing) {
                await apiRequest(
                    `/pets/${encodeURIComponent(editingPetId)}`,
                    {
                        method: "PUT",
                        body: JSON.stringify(payload)
                    }
                );
            } else {
                await apiRequest("/pets", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });
            }

            await loadPetsFromApi();
            renderPets();

            showFormMessage(
                isEditing
                    ? "Pet record updated successfully."
                    : "Pet registered successfully.",
                "#2a9d8f"
            );

            window.setTimeout(closePetDialog, 650);

        } catch (error) {
            console.error("Unable to save pet record:", error);

            showFormMessage(
                `Unable to save pet: ${error.message}`,
                "#c0392b"
            );

        } finally {
            if (savePetButton) {
                savePetButton.disabled = false;
                savePetButton.textContent = originalButtonText;
            }
        }
    });
}

// =========================
// TABLE ACTIONS: VIEW / EDIT / DELETE
// =========================

if (petTableBody) {
    petTableBody.addEventListener("click", async event => {
        const target = event.target instanceof Element
            ? event.target
            : null;

        const button = target
            ? target.closest(".pet-action")
            : null;

        if (!button) return;

        const petId = String(button.dataset.id ?? "");
        const action = button.dataset.action;

        const pet = pets.find(item => String(item.petId) === petId);

        if (!pet) {
            console.warn("Pet not found in the current list:", petId);
            return;
        }

        if (action === "view") {
            alert(
                "PET DETAILS\n\n" +
                `Pet ID: ${pet.petId}\n` +
                `Pet Name: ${pet.petName}\n` +
                `Owner: ${getOwnerName(pet.ownerId)}\n` +
                `Species: ${pet.species}\n` +
                `Breed: ${pet.breed}\n` +
                `Sex: ${pet.sex}\n` +
                `Birth Date: ${pet.birthDate || "None"}\n` +
                `Color: ${pet.color || "Not specified"}\n` +
                `Status: ${pet.status}`
            );
            return;
        }

        if (action === "edit") {
            openEditPetModal(pet);
            return;
        }

        // =========================
        // DELETE PET VIA API
        // =========================

        if (action === "delete") {
            const confirmed = confirm(
                `Are you sure you want to delete this pet record?\n\n` +
                `Pet: ${pet.petName}\n` +
                `Owner: ${getOwnerName(pet.ownerId)}\n\n` +
                `This action cannot be undone.`
            );

            if (!confirmed) return;

            button.disabled = true;
            button.textContent = "…";

            try {
                const result = await apiRequest(
                    `/pets/${encodeURIComponent(petId)}`,
                    { method: "DELETE" }
                );

                await loadPetsFromApi();
                renderPets();

                alert(result.message || "Pet record deleted successfully.");

            } catch (error) {
                console.error("Unable to delete pet record:", error);

                alert(
                    `Unable to delete pet record.\n\n${error.message}`
                );

                button.disabled = false;
                button.textContent = "🗑";
            }
        }
    });
}

// =========================
// SEARCH
// =========================

if (petSearch) {
    petSearch.addEventListener("input", renderPets);
}

// =========================
// INITIALIZE FROM API
// =========================

async function initializePetPage() {
    try {
        if (petEmptyState) {
            petEmptyState.textContent = "Loading pet records...";
            petEmptyState.style.display = "block";
        }

        await Promise.all([
            loadPetsFromApi(),
            loadOwnersFromApi()
        ]);

        populateOwnerDropdown();
        renderPets();

    } catch (error) {
        console.error("Unable to load pet page data:", error);

        if (petTableBody) petTableBody.innerHTML = "";

        if (petEmptyState) {
            petEmptyState.textContent =
                "Unable to load records. Please check the server connection and refresh.";
            petEmptyState.style.display = "block";
        }

        showFormMessage(
            `Unable to load pet and owner records from the database: ${error.message}`,
            "#c0392b"
        );
    }
}

initializePetPage();
