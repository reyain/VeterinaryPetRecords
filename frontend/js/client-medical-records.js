
"use strict";

/* =====================================================
   MEDICAL RECORDS - DATABASE/API VERSION
   ===================================================== */

const API_BASE = "http://localhost:3000/api";

const medicalTableBody = document.getElementById("medicalTableBody");
const medicalEmptyState = document.getElementById("medicalEmptyState");
const medicalSearch = document.getElementById("medicalSearch");
const visibleMedicalCount = document.getElementById("visibleMedicalCount");

const totalMedicalCount = document.getElementById("totalMedicalCount");
const consultationCount = document.getElementById("consultationCount");
const treatmentCount = document.getElementById("treatmentCount");

const addMedicalButton = document.getElementById("addMedicalButton");
const medicalModal = document.getElementById("medicalModal");
const medicalForm = document.getElementById("medicalForm");
const closeMedicalModal = document.getElementById("closeMedicalModal");
const cancelMedicalButton = document.getElementById("cancelMedicalButton");
const saveMedicalButton = document.getElementById("saveMedicalButton");
const modalTitle = document.getElementById("modalTitle");
const medicalFormMessage = document.getElementById("medicalFormMessage");

const medicalPet = document.getElementById("medicalPet");
const medicalDate = document.getElementById("medicalDate");
const veterinarian = document.getElementById("veterinarian");
const recordType = document.getElementById("recordType");
const diagnosis = document.getElementById("diagnosis");
const treatment = document.getElementById("treatment");
const medicalNotes = document.getElementById("medicalNotes");

let medicalRecords = [];
let pets = [];
let editingMedicalId = null;
let loggedInUserId = null;
let isSaving = false;

/* =====================================================
   HELPERS
   ===================================================== */

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function firstValue(object, ...keys) {
    for (const key of keys) {
        if (object && object[key] !== undefined && object[key] !== null) {
            return object[key];
        }
    }
    return "";
}

function getPetId(pet) {
    return Number(firstValue(pet, "petID", "petId", "PetID"));
}

function getPetName(pet) {
    return firstValue(pet, "petName", "PetName", "pet_name") || "Unnamed Pet";
}

function getRecordId(record) {
    return Number(firstValue(
        record,
        "medicalRecordID",
        "medicalRecordId",
        "MedicalRecordID"
    ));
}

function getRecordPetId(record) {
    return Number(firstValue(record, "petID", "petId", "PetID"));
}

function getRecordDate(record) {
    const value = firstValue(record, "visitDate", "VisitDate", "recordDate");
    return value ? String(value).slice(0, 10) : "";
}

function getRecordText(record, ...keys) {
    return String(firstValue(record, ...keys) || "");
}

function getPet(petId) {
    return pets.find(pet => getPetId(pet) === Number(petId));
}

function showMedicalMessage(message, color = "") {
    medicalFormMessage.textContent = message;
    medicalFormMessage.style.color = color || "";
}

async function apiRequest(path, options = {}) {
    let response;

    try {
        response = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers: {
                Accept: "application/json",
                ...(options.body ? { "Content-Type": "application/json" } : {}),
                ...options.headers
            }
        });
    } catch (error) {
        throw new Error(
            "Cannot contact the Node.js API. Check that the backend and C# Bridge are running."
        );
    }

    const text = await response.text();
    let result = {};

    if (text) {
        try {
            result = JSON.parse(text);
        } catch {
            result = { message: text };
        }
    }

    if (!response.ok) {
        throw new Error(
            result.detail ||
            result.message ||
            result.title ||
            `Request failed with HTTP ${response.status}.`
        );
    }

    if (result.success === false) {
        throw new Error(result.message || "The request was unsuccessful.");
    }

    return result;
}

function unwrapData(result) {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result.data)) return result.data;
    if (Array.isArray(result.data?.$values)) return result.data.$values;
    return [];
}

/* =====================================================
   LOAD PETS AND MEDICAL RECORDS
   ===================================================== */

async function loadPetsFromApi() {
    const result = await apiRequest("/pets");
    pets = unwrapData(result);
    populatePetDropdown();
}

async function loadMedicalRecords() {
    medicalTableBody.innerHTML = `
        <tr>
            <td colspan="9">Loading medical records...</td>
        </tr>
    `;

    try {
        const result = await apiRequest("/medical-records");
        medicalRecords = unwrapData(result);
        renderMedicalRecords();
    } catch (error) {
        medicalRecords = [];
        medicalTableBody.innerHTML = `
            <tr>
                <td colspan="9">${escapeHtml(error.message)}</td>
            </tr>
        `;
        medicalEmptyState.style.display = "none";
        visibleMedicalCount.textContent = "0";
        updateSummary();
    }
}

function populatePetDropdown(selectedPetId = "") {
    medicalPet.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = pets.length
        ? "Select Pet"
        : "No registered pets available";
    medicalPet.appendChild(defaultOption);

    for (const pet of pets) {
        const option = document.createElement("option");
        option.value = String(getPetId(pet));
        option.textContent = `${getPetName(pet)} (ID: ${getPetId(pet)})`;

        if (Number(selectedPetId) === getPetId(pet)) {
            option.selected = true;
        }

        medicalPet.appendChild(option);
    }
}

/* =====================================================
   CURRENT USER
   ===================================================== */

// The medical_records.user_id column must contain the actual
// logged-in staff user's ID. Do not use the veterinarian's
// display name as a substitute for this numeric ID.

function findLoggedInUserId() {
    const sessionUser = sessionStorage.getItem("vetCurrentUser");

    if (sessionUser) {
        try {
            const user = JSON.parse(sessionUser);

            // The database requires a numeric user ID.
            const userId = Number(
                user.userId ?? user.userID ?? user.UserID ?? user.id
            );

            if (Number.isInteger(userId) && userId > 0) {
                return userId;
            }
        } catch (error) {
            console.error("Unable to read logged-in user:", error);
        }
    }

    const possibleKeys = [
        "user",
        "currentUser",
        "loggedInUser",
        "current_user",
        "authUser"
    ];

    for (const key of possibleKeys) {
        const storedValue =
            sessionStorage.getItem(key) ??
            localStorage.getItem(key);

        if (!storedValue) continue;

        try {
            const user = JSON.parse(storedValue);
            const userId = Number(
                user.userId ?? user.userID ?? user.UserID ?? user.id
            );

            if (Number.isInteger(userId) && userId > 0) {
                return userId;
            }
        } catch (error) {
            // Continue checking other possible session keys.
        }
    }

    return null;
}


/* =====================================================
   PET / OWNER DISPLAY HELPERS
   ===================================================== */

function getOwnerNameFromPet(pet) {
    if (!pet) return "Unknown Owner";

    return firstValue(
        pet,
        "ownerName",
        "OwnerName",
        "ownerFullName",
        "OwnerFullName"
    ) || "Owner ID: " + firstValue(pet, "ownerID", "ownerId", "OwnerID");
}

function getUserDisplayName() {
    const possibleKeys = ["user", "currentUser", "loggedInUser", "current_user", "authUser"];

    for (const key of possibleKeys) {
        try {
            const user = JSON.parse(localStorage.getItem(key) || "null");
            const name = firstValue(user, "fullName", "FullName", "name", "Name");
            if (name) return name;
        } catch {
            // Continue checking.
        }
    }

    return "";
}

/* =====================================================
   RENDER TABLE
   ===================================================== */

function renderMedicalRecords() {
    const search = medicalSearch.value.trim().toLowerCase();

    const filteredRecords = medicalRecords.filter(record => {
        const pet = getPet(getRecordPetId(record));

        const searchable = [
            getRecordId(record),
            getRecordDate(record),
            pet ? getPetName(pet) : "",
            pet ? getOwnerNameFromPet(pet) : "",
            getRecordText(record, "diagnosis", "Diagnosis"),
            getRecordText(record, "treatment", "Treatment"),
            getRecordText(record, "chiefComplaint", "ChiefComplaint"),
            getRecordText(record, "symptoms", "Symptoms"),
            getRecordText(record, "medications", "Medications"),
            getRecordText(record, "recommendations", "Recommendations"),
            getRecordText(record, "remarks", "Remarks")
        ].join(" ").toLowerCase();

        return searchable.includes(search);
    });

    medicalTableBody.innerHTML = "";

    for (const record of filteredRecords) {
        const pet = getPet(getRecordPetId(record));
        const petName = pet ? getPetName(pet) : `Pet ID: ${getRecordPetId(record)}`;
        const ownerName = getOwnerNameFromPet(pet);
        const id = getRecordId(record);
        const recordDiagnosis = getRecordText(record, "diagnosis", "Diagnosis");
        const recordTreatment = getRecordText(record, "treatment", "Treatment");
        const staffId = Number(firstValue(record, "userID", "userId", "UserID"));

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHtml(id)}</td>
            <td>${escapeHtml(getRecordDate(record))}</td>
            <td>
                <div class="medical-pet-cell">
                    <div class="medical-pet-avatar">🐾</div>
                    <div>
                        <strong>${escapeHtml(petName)}</strong>
                        <small>Pet ID: ${escapeHtml(getRecordPetId(record))}</small>
                    </div>
                </div>
            </td>
            <td>${escapeHtml(ownerName)}</td>
            <td>${escapeHtml(staffId ? `Staff ID: ${staffId}` : "Not specified")}</td>
            <td><span class="medical-type">Medical Record</span></td>
            <td>${escapeHtml(recordDiagnosis)}</td>
            <td>${escapeHtml(recordTreatment)}</td>
            <td>
                <div class="medical-actions">
                    <button type="button" class="medical-action medical-view-action"
                        data-action="view" data-id="${id}" title="View medical record">👁</button>
                    <button type="button" class="medical-action medical-edit-action"
                        data-action="edit" data-id="${id}" title="Edit medical record">✎</button>
                    <button type="button" class="medical-action medical-delete-action"
                        data-action="delete" data-id="${id}" title="Delete medical record">🗑</button>
                </div>
            </td>
        `;

        medicalTableBody.appendChild(row);
    }

    medicalEmptyState.style.display = filteredRecords.length === 0 ? "block" : "none";
    visibleMedicalCount.textContent = String(filteredRecords.length);
    updateSummary();
}

function updateSummary() {
    totalMedicalCount.textContent = String(medicalRecords.length);

    // Record type is not currently stored in the database.
    // These cards therefore reflect the available database records.
    consultationCount.textContent = "—";
    treatmentCount.textContent = String(
        medicalRecords.filter(record =>
            getRecordText(record, "treatment", "Treatment").trim() !== ""
        ).length
    );
}

/* =====================================================
   MODAL
   ===================================================== */

function openAddMedicalModal() {
    editingMedicalId = null;
    medicalForm.reset();

    modalTitle.textContent = "Add Medical Record";
    saveMedicalButton.textContent = "Save Medical Record";

    populatePetDropdown();

    const now = new Date();
    medicalDate.value = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0")
    ].join("-");

    veterinarian.value = getUserDisplayName();
    showMedicalMessage("");

    medicalModal.classList.add("show");
    medicalPet.focus();
}

function openEditMedicalModal(record) {
    editingMedicalId = getRecordId(record);

    modalTitle.textContent = "Edit Medical Record";
    saveMedicalButton.textContent = "Update Medical Record";

    medicalForm.reset();
    populatePetDropdown(getRecordPetId(record));

    medicalPet.value = String(getRecordPetId(record));
    medicalDate.value = getRecordDate(record);

    veterinarian.value = getUserDisplayName() ||
        `Staff ID: ${firstValue(record, "userID", "userId", "UserID")}`;

    recordType.value = "";
    diagnosis.value = getRecordText(record, "diagnosis", "Diagnosis");
    treatment.value = getRecordText(record, "treatment", "Treatment");

    document.getElementById("medicalChiefComplaint").value =
        getRecordText(record, "chiefComplaint", "ChiefComplaint");
    document.getElementById("medicalSymptoms").value =
        getRecordText(record, "symptoms", "Symptoms");
    document.getElementById("medicalExaminationFindings").value =
        getRecordText(record, "examinationFindings", "ExaminationFindings");
    document.getElementById("medicalMedications").value =
        getRecordText(record, "medications", "Medications");
    document.getElementById("medicalRecommendations").value =
        getRecordText(record, "recommendations", "Recommendations");
    medicalNotes.value = getRecordText(record, "remarks", "Remarks");

    showMedicalMessage("");
    medicalModal.classList.add("show");
    medicalPet.focus();
}

function closeMedicalDialog() {
    medicalModal.classList.remove("show");
    medicalForm.reset();
    editingMedicalId = null;
    showMedicalMessage("");
}

addMedicalButton.addEventListener("click", openAddMedicalModal);
closeMedicalModal.addEventListener("click", closeMedicalDialog);
cancelMedicalButton.addEventListener("click", closeMedicalDialog);

medicalModal.addEventListener("click", event => {
    if (event.target === medicalModal) {
        closeMedicalDialog();
    }
});

/* =====================================================
   CREATE / UPDATE
   ===================================================== */

medicalForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (isSaving) return;

    const petID = Number(medicalPet.value);
    const visitDate = medicalDate.value;
    const diagnosisValue = diagnosis.value.trim();

    if (!Number.isInteger(petID) || petID <= 0) {
        showMedicalMessage("Please select a registered pet.", "#c0392b");
        return;
    }

    if (!visitDate) {
        showMedicalMessage("Please select the visit date.", "#c0392b");
        return;
    }

    if (!diagnosisValue) {
        showMedicalMessage("Diagnosis is required.", "#c0392b");
        diagnosis.focus();
        return;
    }

    const existingRecord = editingMedicalId
        ? medicalRecords.find(record => getRecordId(record) === editingMedicalId)
        : null;

    const userID = existingRecord
        ? Number(firstValue(existingRecord, "userID", "userId", "UserID"))
        : loggedInUserId;

    if (!Number.isInteger(userID) || userID <= 0) {
        showMedicalMessage(
            "The logged-in staff ID could not be found. Please check your login/session code before saving.",
            "#c0392b"
        );
        return;
    }

    const payload = {
        PetID: petID,
        UserID: userID,
        VisitDate: `${visitDate}T00:00:00`,
        ChiefComplaint: document.getElementById("medicalChiefComplaint").value.trim(),
        Symptoms: document.getElementById("medicalSymptoms").value.trim(),
        ExaminationFindings: document.getElementById("medicalExaminationFindings").value.trim(),
        Diagnosis: diagnosisValue,
        Treatment: treatment.value.trim(),
        Medications: document.getElementById("medicalMedications").value.trim(),
        Remarks: medicalNotes.value.trim(),
        Recommendations: document.getElementById("medicalRecommendations").value.trim()
    };

    isSaving = true;
    saveMedicalButton.disabled = true;
    saveMedicalButton.textContent = "Saving...";

    try {
        if (editingMedicalId) {
            await apiRequest(`/medical-records/${editingMedicalId}`, {
                method: "PUT",
                body: JSON.stringify(payload)
            });
        } else {
            await apiRequest("/medical-records", {
                method: "POST",
                body: JSON.stringify(payload)
            });
        }

        await loadMedicalRecords();
        closeMedicalDialog();
        alert(editingMedicalId
            ? "Medical record updated successfully."
            : "Medical record added successfully.");
    } catch (error) {
        showMedicalMessage(error.message, "#c0392b");
    } finally {
        isSaving = false;
        saveMedicalButton.disabled = false;
        saveMedicalButton.textContent = editingMedicalId
            ? "Update Medical Record"
            : "Save Medical Record";
    }
});

/* =====================================================
   VIEW / EDIT / DELETE
   ===================================================== */

medicalTableBody.addEventListener("click", async event => {
    const button = event.target.closest(".medical-action");
    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;
    const record = medicalRecords.find(item => getRecordId(item) === id);

    if (!record) return;

    if (action === "edit") {
        openEditMedicalModal(record);
        return;
    }

    if (action === "view") {
        const pet = getPet(getRecordPetId(record));

        const details = [
            `Medical Record ID: ${getRecordId(record)}`,
            `Visit Date: ${getRecordDate(record)}`,
            `Pet: ${pet ? getPetName(pet) : `Pet ID ${getRecordPetId(record)}`}`,
            `Staff User ID: ${firstValue(record, "userID", "userId", "UserID")}`,
            `Chief Complaint: ${getRecordText(record, "chiefComplaint", "ChiefComplaint") || "None"}`,
            `Symptoms: ${getRecordText(record, "symptoms", "Symptoms") || "None"}`,
            `Examination Findings: ${getRecordText(record, "examinationFindings", "ExaminationFindings") || "None"}`,
            `Diagnosis: ${getRecordText(record, "diagnosis", "Diagnosis")}`,
            `Treatment: ${getRecordText(record, "treatment", "Treatment") || "None"}`,
            `Medications: ${getRecordText(record, "medications", "Medications") || "None"}`,
            `Remarks: ${getRecordText(record, "remarks", "Remarks") || "None"}`,
            `Recommendations: ${getRecordText(record, "recommendations", "Recommendations") || "None"}`
        ];

        alert(details.join("\n\n"));
        return;
    }

    if (action === "delete") {
        const pet = getPet(getRecordPetId(record));
        const confirmed = confirm(
            `Delete medical record #${id} for ${pet ? getPetName(pet) : "this pet"}?\n\nThis action cannot be undone.`
        );

        if (!confirmed) return;

        button.disabled = true;

        try {
            await apiRequest(`/medical-records/${id}`, {
                method: "DELETE"
            });

            await loadMedicalRecords();
            alert("Medical record deleted successfully.");
        } catch (error) {
            alert(`Unable to delete medical record:\n${error.message}`);
            button.disabled = false;
        }
    }
});

medicalSearch.addEventListener("input", renderMedicalRecords);

/* =====================================================
   INITIALIZE
   ===================================================== */

async function initializeMedicalRecords() {
    loggedInUserId = findLoggedInUserId();

    try {
        await loadPetsFromApi();
    } catch (error) {
        medicalPet.innerHTML = "";
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Unable to load pets";
        medicalPet.appendChild(option);
        console.error("Could not load pets:", error);
    }

    await loadMedicalRecords();
}

initializeMedicalRecords();
