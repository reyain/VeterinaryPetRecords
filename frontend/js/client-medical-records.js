// =========================
// SESSION / ROLE
// =========================

const username =
    sessionStorage.getItem("demoUsername");

const role =
    sessionStorage.getItem("demoRole");


const allowedRoles = [
    "Front Desk",
    "Veterinarian"
];


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


// =========================
// STORAGE KEYS
// =========================

const PET_STORAGE_KEY =
    "vetPetPets";

const MEDICAL_STORAGE_KEY =
    "vetPetMedicalRecords";


// =========================
// LOAD PETS
// =========================

function loadPets() {

    const savedPets =
        localStorage.getItem(
            PET_STORAGE_KEY
        );


    if (!savedPets) {

        return [];

    }


    try {

        const parsedPets =
            JSON.parse(
                savedPets
            );


        return Array.isArray(parsedPets)
            ? parsedPets
            : [];

    } catch (error) {

        console.error(
            "Unable to load pets:",
            error
        );

        return [];

    }

}


// =========================
// LOAD MEDICAL RECORDS
// =========================

function loadMedicalRecords() {

    const savedRecords =
        localStorage.getItem(
            MEDICAL_STORAGE_KEY
        );


    if (!savedRecords) {

        localStorage.setItem(
            MEDICAL_STORAGE_KEY,
            JSON.stringify([])
        );


        return [];

    }


    try {

        const parsedRecords =
            JSON.parse(
                savedRecords
            );


        return Array.isArray(
            parsedRecords
        )
            ? parsedRecords
            : [];

    } catch (error) {

        console.error(
            "Unable to load medical records:",
            error
        );

        return [];

    }

}


// =========================
// DATA
// =========================

let pets =
    loadPets();

let medicalRecords =
    loadMedicalRecords();


// =========================
// ELEMENTS
// =========================

const medicalTableBody =
    document.getElementById(
        "medicalTableBody"
    );

const medicalEmptyState =
    document.getElementById(
        "medicalEmptyState"
    );

const medicalSearch =
    document.getElementById(
        "medicalSearch"
    );

const totalMedicalCount =
    document.getElementById(
        "totalMedicalCount"
    );

const consultationCount =
    document.getElementById(
        "consultationCount"
    );

const treatmentCount =
    document.getElementById(
        "treatmentCount"
    );

const visibleMedicalCount =
    document.getElementById(
        "visibleMedicalCount"
    );


// =========================
// MODAL
// =========================

const medicalModal =
    document.getElementById(
        "medicalModal"
    );

const medicalForm =
    document.getElementById(
        "medicalForm"
    );

const modalTitle =
    document.getElementById(
        "modalTitle"
    );

const addMedicalButton =
    document.getElementById(
        "addMedicalButton"
    );

const closeMedicalModal =
    document.getElementById(
        "closeMedicalModal"
    );

const cancelMedicalButton =
    document.getElementById(
        "cancelMedicalButton"
    );

const saveMedicalButton =
    document.getElementById(
        "saveMedicalButton"
    );

const medicalFormMessage =
    document.getElementById(
        "medicalFormMessage"
    );


// =========================
// FORM FIELDS
// =========================

const medicalPet =
    document.getElementById(
        "medicalPet"
    );

const medicalDate =
    document.getElementById(
        "medicalDate"
    );

const veterinarian =
    document.getElementById(
        "veterinarian"
    );

const recordType =
    document.getElementById(
        "recordType"
    );

const diagnosis =
    document.getElementById(
        "diagnosis"
    );

const treatment =
    document.getElementById(
        "treatment"
    );

const medicalNotes =
    document.getElementById(
        "medicalNotes"
    );


// =========================
// EDIT MODE
// =========================

let editingMedicalId =
    null;


// =========================
// PET LOOKUP
// =========================

function getPet(
    petId
) {

    return pets.find(
        pet =>
            pet.petId === petId
    );

}


// =========================
// OWNER LOOKUP THROUGH PET
// =========================

function getOwnerNameFromPet(
    pet
) {

    if (!pet) {

        return "Unknown Owner";

    }


    const ownerStorage =
        localStorage.getItem(
            "vetPetOwners"
        );


    if (!ownerStorage) {

        return "Unknown Owner";

    }


    try {

        const owners =
            JSON.parse(
                ownerStorage
            );


        if (!Array.isArray(owners)) {

            return "Unknown Owner";

        }


        const owner =
            owners.find(
                item =>
                    item.ownerId ===
                    pet.ownerId
            );


        if (!owner) {

            return "Unknown Owner";

        }


        let fullName =
            [
                owner.firstName,
                owner.middleName,
                owner.lastName
            ]
            .filter(Boolean)
            .join(" ");


        if (owner.nameExtension) {

            fullName +=
                `, ${owner.nameExtension}`;

        }


        return fullName;

    } catch (error) {

        console.error(
            "Unable to read owners:",
            error
        );

        return "Unknown Owner";

    }

}


// =========================
// SAVE DATA
// =========================

function saveMedicalRecords() {

    localStorage.setItem(
        MEDICAL_STORAGE_KEY,
        JSON.stringify(
            medicalRecords
        )
    );

}


// =========================
// GENERATE ID
// =========================

function generateMedicalId() {

    if (
        medicalRecords.length === 0
    ) {

        return "MED-0001";

    }


    const highestNumber =
        medicalRecords.reduce(
            (
                highest,
                record
            ) => {

                const number =
                    parseInt(
                        record.recordId
                            .replace(
                                "MED-",
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


    return `MED-${String(
        highestNumber + 1
    ).padStart(4, "0")}`;

}


// =========================
// ESCAPE HTML
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
// POPULATE PET DROPDOWN
// =========================

function populatePetDropdown(
    selectedPetId = ""
) {

    pets =
        loadPets();


    medicalPet.innerHTML =
        "";


    const defaultOption =
        document.createElement(
            "option"
        );


    defaultOption.value =
        "";


    defaultOption.textContent =
        pets.length > 0
            ? "Select Pet"
            : "No registered pets available";


    medicalPet.appendChild(
        defaultOption
    );


    pets.forEach(
        (pet) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                pet.petId;


            option.textContent =
                `${pet.petId} — ${pet.petName}`;


            if (
                pet.petId ===
                selectedPetId
            ) {

                option.selected =
                    true;

            }


            medicalPet.appendChild(
                option
            );

        }
    );

}


// =========================
// RENDER TABLE
// =========================

function renderMedicalRecords() {

    pets =
        loadPets();


    const searchValue =
        medicalSearch.value
            .toLowerCase()
            .trim();


    medicalTableBody.innerHTML =
        "";


    const filteredRecords =
        medicalRecords.filter(
            (record) => {

                const pet =
                    getPet(
                        record.petId
                    );


                const petName =
                    pet
                        ? pet.petName
                        : "Unknown Pet";


                const ownerName =
                    getOwnerNameFromPet(
                        pet
                    );


                const searchableText =
                    [
                        record.recordId,
                        record.recordDate,
                        petName,
                        ownerName,
                        record.veterinarian,
                        record.recordType,
                        record.diagnosis,
                        record.treatment,
                        record.notes
                    ]
                    .join(" ")
                    .toLowerCase();


                return searchableText.includes(
                    searchValue
                );

            }
        );


    filteredRecords.forEach(
        (record) => {

            const pet =
                getPet(
                    record.petId
                );


            const petName =
                pet
                    ? pet.petName
                    : "Unknown Pet";


            const ownerName =
                getOwnerNameFromPet(
                    pet
                );


            const row =
                document.createElement(
                    "tr"
                );


            const icon =
                pet && pet.species === "Dog"
                    ? "🐕"
                    : pet && pet.species === "Cat"
                        ? "🐈"
                        : "🐾";


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        record.recordId
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        record.recordDate
                    )}
                </td>


                <td>

                    <div class="medical-pet-cell">

                        <div class="medical-pet-avatar">
                            ${icon}
                        </div>

                        <div>

                            <strong>
                                ${escapeHtml(
                                    petName
                                )}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    record.petId
                                )}
                            </small>

                        </div>

                    </div>

                </td>


                <td>
                    ${escapeHtml(
                        ownerName
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        record.veterinarian
                    )}
                </td>


                <td>

                    <span class="medical-type">

                        ${escapeHtml(
                            record.recordType
                        )}

                    </span>

                </td>


                <td>
                    ${escapeHtml(
                        record.diagnosis
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        record.treatment
                    )}
                </td>


                <td>

                    <div class="medical-actions">

                        <button
                            type="button"
                            class="medical-action medical-view-action"
                            data-action="view"
                            data-id="${escapeHtml(
                                record.recordId
                            )}"
                            title="View medical record"
                        >
                            👁
                        </button>


                        <button
                            type="button"
                            class="medical-action medical-edit-action"
                            data-action="edit"
                            data-id="${escapeHtml(
                                record.recordId
                            )}"
                            title="Edit medical record"
                        >
                            ✎
                        </button>


                        <button
                            type="button"
                            class="medical-action medical-delete-action"
                            data-action="delete"
                            data-id="${escapeHtml(
                                record.recordId
                            )}"
                            title="Delete medical record"
                        >
                            🗑
                        </button>

                    </div>

                </td>

            `;


            medicalTableBody.appendChild(
                row
            );

        }
    );


    medicalEmptyState.style.display =
        filteredRecords.length === 0
            ? "block"
            : "none";


    visibleMedicalCount.textContent =
        filteredRecords.length;


    updateSummary();

}


// =========================
// SUMMARY
// =========================

function updateSummary() {

    const total =
        medicalRecords.length;


    const consultations =
        medicalRecords.filter(
            record =>
                record.recordType ===
                "Consultation"
        ).length;


    const treatments =
        medicalRecords.filter(
            record =>
                record.recordType ===
                "Treatment"
        ).length;


    totalMedicalCount.textContent =
        total;


    consultationCount.textContent =
        consultations;


    treatmentCount.textContent =
        treatments;

}


// =========================
// OPEN ADD
// =========================

function openAddMedicalModal() {

    editingMedicalId =
        null;


    modalTitle.textContent =
        "Add Medical Record";


    saveMedicalButton.textContent =
        "Save Medical Record";


    medicalForm.reset();


    populatePetDropdown();


    /*
        Use the current date as the default
        record date.
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


    medicalDate.value =
        `${year}-${month}-${day}`;


    medicalFormMessage.textContent =
        "";


    medicalFormMessage.style.color =
        "";


    medicalModal.classList.add(
        "show"
    );


    medicalPet.focus();

}


// =========================
// OPEN EDIT
// =========================

function openEditMedicalModal(
    record
) {

    editingMedicalId =
        record.recordId;


    modalTitle.textContent =
        "Edit Medical Record";


    saveMedicalButton.textContent =
        "Update Medical Record";


    populatePetDropdown(
        record.petId
    );


    medicalPet.value =
        record.petId;


    medicalDate.value =
        record.recordDate;


    veterinarian.value =
        record.veterinarian;


    recordType.value =
        record.recordType;


    diagnosis.value =
        record.diagnosis;


    treatment.value =
        record.treatment;


    medicalNotes.value =
        record.notes || "";


    medicalFormMessage.textContent =
        "";


    medicalFormMessage.style.color =
        "";


    medicalModal.classList.add(
        "show"
    );


    medicalPet.focus();

}


// =========================
// CLOSE
// =========================

function closeMedicalDialog() {

    medicalModal.classList.remove(
        "show"
    );


    medicalForm.reset();


    editingMedicalId =
        null;


    medicalFormMessage.textContent =
        "";


    medicalFormMessage.style.color =
        "";

}


// =========================
// MODAL EVENTS
// =========================

addMedicalButton.addEventListener(
    "click",
    openAddMedicalModal
);


closeMedicalModal.addEventListener(
    "click",
    closeMedicalDialog
);


cancelMedicalButton.addEventListener(
    "click",
    closeMedicalDialog
);


medicalModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            medicalModal
        ) {

            closeMedicalDialog();

        }

    }
);


// =========================
// CREATE / UPDATE
// =========================

medicalForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        const formData = {

            petId:
                medicalPet.value,

            recordDate:
                medicalDate.value,

            veterinarian:
                veterinarian.value.trim(),

            recordType:
                recordType.value,

            diagnosis:
                diagnosis.value.trim(),

            treatment:
                treatment.value.trim(),

            notes:
                medicalNotes.value.trim()

        };


        // =========================
        // VALIDATION
        // =========================

        if (!formData.petId) {

            showMedicalMessage(
                "Please select a pet.",
                "#c0392b"
            );

            return;

        }


        if (!formData.recordDate) {

            showMedicalMessage(
                "Please select the record date.",
                "#c0392b"
            );

            return;

        }


        if (!formData.veterinarian) {

            showMedicalMessage(
                "Please enter the veterinarian name.",
                "#c0392b"
            );

            return;

        }


        if (!formData.recordType) {

            showMedicalMessage(
                "Please select the record type.",
                "#c0392b"
            );

            return;

        }


        if (!formData.diagnosis) {

            showMedicalMessage(
                "Please enter the diagnosis.",
                "#c0392b"
            );

            return;

        }


        if (!formData.treatment) {

            showMedicalMessage(
                "Please enter the treatment or procedure.",
                "#c0392b"
            );

            return;

        }


        // =========================
        // UPDATE
        // =========================

        if (editingMedicalId) {

            const recordIndex =
                medicalRecords.findIndex(
                    record =>
                        record.recordId ===
                        editingMedicalId
                );


            if (
                recordIndex === -1
            ) {

                showMedicalMessage(
                    "Medical record could not be found.",
                    "#c0392b"
                );

                return;

            }


            medicalRecords[
                recordIndex
            ] = {

                ...medicalRecords[
                    recordIndex
                ],

                ...formData

            };


            saveMedicalRecords();

            renderMedicalRecords();


            showMedicalMessage(
                "Medical record updated successfully.",
                "#2a9d8f"
            );

        }

        // =========================
        // CREATE
        // =========================

        else {

            const newRecord = {

                recordId:
                    generateMedicalId(),

                ...formData

            };


            medicalRecords.push(
                newRecord
            );


            saveMedicalRecords();

            renderMedicalRecords();


            showMedicalMessage(
                "Medical record added successfully.",
                "#2a9d8f"
            );

        }


        setTimeout(
            closeMedicalDialog,
            600
        );

    }
);


// =========================
// TABLE ACTIONS
// =========================

medicalTableBody.addEventListener(
    "click",
    (event) => {

        const button =
            event.target.closest(
                ".medical-action"
            );


        if (!button) {
            return;
        }


        const recordId =
            button.dataset.id;


        const action =
            button.dataset.action;


        const record =
            medicalRecords.find(
                item =>
                    item.recordId ===
                    recordId
            );


        if (!record) {
            return;
        }


        const pet =
            getPet(
                record.petId
            );


        const petName =
            pet
                ? pet.petName
                : "Unknown Pet";


        const ownerName =
            getOwnerNameFromPet(
                pet
            );


        // =========================
        // VIEW
        // =========================

        if (action === "view") {

            alert(

                "MEDICAL RECORD\n\n" +

                `Record ID: ${
                    record.recordId
                }\n` +

                `Date: ${
                    record.recordDate
                }\n` +

                `Pet: ${
                    petName
                }\n` +

                `Owner: ${
                    ownerName
                }\n` +

                `Veterinarian: ${
                    record.veterinarian
                }\n` +

                `Record Type: ${
                    record.recordType
                }\n` +

                `Diagnosis: ${
                    record.diagnosis
                }\n` +

                `Treatment: ${
                    record.treatment
                }\n` +

                `Notes: ${
                    record.notes || "None"
                }`

            );


            return;

        }


        // =========================
        // EDIT
        // =========================

        if (action === "edit") {

            openEditMedicalModal(
                record
            );


            return;

        }


        // =========================
        // DELETE
        // =========================

        if (action === "delete") {

            const confirmed =
                confirm(

                    `Delete this medical record?\n\n` +

                    `Pet: ${petName}\n` +

                    `Record: ${
                        record.recordId
                    }`

                );


            if (!confirmed) {
                return;
            }


            medicalRecords =
                medicalRecords.filter(
                    item =>
                        item.recordId !==
                        recordId
                );


            saveMedicalRecords();

            renderMedicalRecords();

        }

    }
);


// =========================
// SEARCH
// =========================

medicalSearch.addEventListener(
    "input",
    renderMedicalRecords
);


// =========================
// INITIALIZE
// =========================

populatePetDropdown();

renderMedicalRecords();