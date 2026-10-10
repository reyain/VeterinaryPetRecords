// =========================
// SESSION / ROLE CHECK
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

const VACCINATION_STORAGE_KEY =
    "vetPetVaccinations";


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


        return Array.isArray(
            parsedPets
        )
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
// LOAD VACCINATIONS
// =========================

function loadVaccinations() {

    const savedVaccinations =
        localStorage.getItem(
            VACCINATION_STORAGE_KEY
        );


    if (!savedVaccinations) {

        localStorage.setItem(
            VACCINATION_STORAGE_KEY,
            JSON.stringify([])
        );


        return [];

    }


    try {

        const parsedVaccinations =
            JSON.parse(
                savedVaccinations
            );


        return Array.isArray(
            parsedVaccinations
        )
            ? parsedVaccinations
            : [];

    } catch (error) {

        console.error(
            "Unable to load vaccinations:",
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

let vaccinations =
    loadVaccinations();


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

const totalVaccinationCount =
    document.getElementById(
        "totalVaccinationCount"
    );

const dueSoonCount =
    document.getElementById(
        "dueSoonCount"
    );

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

function getPet(
    petId
) {

    return pets.find(
        pet =>
            pet.petId === petId
    );

}


// =========================
// GET OWNER NAME
// =========================

function getOwnerNameFromPet(
    pet
) {

    if (!pet) {

        return "Unknown Owner";

    }


    const savedOwners =
        localStorage.getItem(
            "vetPetOwners"
        );


    if (!savedOwners) {

        return "Unknown Owner";

    }


    try {

        const owners =
            JSON.parse(
                savedOwners
            );


        if (!Array.isArray(
            owners
        )) {

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
            "Unable to load owner:",
            error
        );

        return "Unknown Owner";

    }

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

function calculateVaccinationStatus(
    dueDate
) {

    if (!dueDate) {

        return "Up to Date";

    }


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const due =
        new Date(
            `${dueDate}T00:00:00`
        );


    const difference =
        due.getTime()
        -
        today.getTime();


    const days =
        Math.ceil(
            difference /
            (
                1000 *
                60 *
                60 *
                24
            )
        );


    if (days < 0) {

        return "Overdue";

    }


    if (days <= 30) {

        return "Due Soon";

    }


    return "Up to Date";

}


// =========================
// STATUS CLASS
// =========================

function applyStatusClass(
    element,
    status
) {

    element.classList.remove(
        "up-to-date-status",
        "due-soon-status",
        "overdue-status"
    );


    if (
        status ===
        "Up to Date"
    ) {

        element.classList.add(
            "up-to-date-status"
        );

    }


    if (
        status ===
        "Due Soon"
    ) {

        element.classList.add(
            "due-soon-status"
        );

    }


    if (
        status ===
        "Overdue"
    ) {

        element.classList.add(
            "overdue-status"
        );

    }

}


// =========================
// UPDATE PREVIEW
// =========================

function updateStatusPreview() {

    const status =
        calculateVaccinationStatus(
            nextDueDate.value
        );


    statusPreview.textContent =
        status;


    statusPreview.classList.remove(
        "preview-up-to-date",
        "preview-due-soon",
        "preview-overdue"
    );


    if (
        status ===
        "Up to Date"
    ) {

        statusPreview.classList.add(
            "preview-up-to-date"
        );

    }


    if (
        status ===
        "Due Soon"
    ) {

        statusPreview.classList.add(
            "preview-due-soon"
        );

    }


    if (
        status ===
        "Overdue"
    ) {

        statusPreview.classList.add(
            "preview-overdue"
        );

    }

}


// =========================
// POPULATE PET DROPDOWN
// =========================

function populatePetDropdown(
    selectedPetId = ""
) {

    pets =
        loadPets();


    vaccinationPet.innerHTML =
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


    vaccinationPet.appendChild(
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


            vaccinationPet.appendChild(
                option
            );

        }
    );

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

    pets =
        loadPets();


    const searchValue =
        vaccinationSearch.value
            .toLowerCase()
            .trim();


    vaccinationTableBody.innerHTML =
        "";


    const filteredVaccinations =
        vaccinations.filter(
            (vaccination) => {

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


                const searchableText =
                    [
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


                return searchableText.includes(
                    searchValue
                );

            }
        );


    filteredVaccinations.forEach(
        (vaccination) => {

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


            const row =
                document.createElement(
                    "tr"
                );


            const icon =
                getPetIcon(
                    pet
                );


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        vaccination.vaccinationId
                    )}
                </td>


                <td>

                    <div
                        class="vaccination-pet-cell"
                    >

                        <div
                            class="vaccination-pet-avatar"
                        >
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
                                    vaccination.petId
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
                        vaccination.vaccineName
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        vaccination.dateGiven
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        vaccination.nextDueDate
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        vaccination.veterinarian
                    )}
                </td>


                <td>

                    <span
                        class="vaccination-status"
                    >
                        ${escapeHtml(
                            status
                        )}
                    </span>

                </td>


                <td>

                    <div
                        class="vaccination-actions"
                    >

                        <button
                            type="button"
                            class="vaccination-action vaccination-view-action"
                            data-action="view"
                            data-id="${escapeHtml(
                                vaccination.vaccinationId
                            )}"
                            title="View vaccination"
                        >
                            👁
                        </button>


                        <button
                            type="button"
                            class="vaccination-action vaccination-edit-action"
                            data-action="edit"
                            data-id="${escapeHtml(
                                vaccination.vaccinationId
                            )}"
                            title="Edit vaccination"
                        >
                            ✎
                        </button>


                        <button
                            type="button"
                            class="vaccination-action vaccination-delete-action"
                            data-action="delete"
                            data-id="${escapeHtml(
                                vaccination.vaccinationId
                            )}"
                            title="Delete vaccination"
                        >
                            🗑
                        </button>

                    </div>

                </td>

            `;


            const statusElement =
                row.querySelector(
                    ".vaccination-status"
                );


            applyStatusClass(
                statusElement,
                status
            );


            vaccinationTableBody.appendChild(
                row
            );

        }
    );


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

    let overdue = 0;


    vaccinations.forEach(
        (vaccination) => {

            const status =
                calculateVaccinationStatus(
                    vaccination.nextDueDate
                );


            if (
                status ===
                "Due Soon"
            ) {

                dueSoon++;

            }


            if (
                status ===
                "Overdue"
            ) {

                overdue++;

            }

        }
    );


    totalVaccinationCount.textContent =
        vaccinations.length;


    dueSoonCount.textContent =
        dueSoon;


    overdueCount.textContent =
        overdue;

}


// =========================
// OPEN ADD MODAL
// =========================

function openAddVaccinationModal() {

    editingVaccinationId =
        null;


    modalTitle.textContent =
        "Add Vaccination Record";


    saveVaccinationButton.textContent =
        "Save Vaccination";


    vaccinationForm.reset();


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


    vaccinationVeterinarian.value =
        vaccination.veterinarian;


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

vaccinationForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        const formData = {

            petId:
                vaccinationPet.value,

            vaccineName:
                vaccineName.value.trim(),

            dateGiven:
                dateGiven.value,

            nextDueDate:
                nextDueDate.value,

            veterinarian:
                vaccinationVeterinarian.value.trim(),

            remarks:
                vaccinationRemarks.value.trim()

        };


        // =========================
        // VALIDATION
        // =========================

        if (
            !formData.petId
        ) {

            showVaccinationMessage(
                "Please select a pet.",
                "#c0392b"
            );

            return;

        }


        if (
            !formData.vaccineName
        ) {

            showVaccinationMessage(
                "Vaccine name is required.",
                "#c0392b"
            );

            return;

        }


        if (
            !formData.dateGiven
        ) {

            showVaccinationMessage(
                "Date given is required.",
                "#c0392b"
            );

            return;

        }


        if (
            !formData.nextDueDate
        ) {

            showVaccinationMessage(
                "Next due date is required.",
                "#c0392b"
            );

            return;

        }


        if (
            formData.nextDueDate <
            formData.dateGiven
        ) {

            showVaccinationMessage(
                "Next due date cannot be earlier than the date given.",
                "#c0392b"
            );

            return;

        }


        if (
            !formData.veterinarian
        ) {

            showVaccinationMessage(
                "Veterinarian name is required.",
                "#c0392b"
            );

            return;

        }


        // =========================
        // UPDATE
        // =========================

        if (
            editingVaccinationId
        ) {

            const vaccinationIndex =
                vaccinations.findIndex(
                    vaccination =>
                        vaccination.vaccinationId ===
                        editingVaccinationId
                );


            if (
                vaccinationIndex === -1
            ) {

                showVaccinationMessage(
                    "Vaccination record could not be found.",
                    "#c0392b"
                );

                return;

            }


            vaccinations[
                vaccinationIndex
            ] = {

                ...vaccinations[
                    vaccinationIndex
                ],

                ...formData

            };


            saveVaccinations();

            renderVaccinations();


            showVaccinationMessage(
                "Vaccination record updated successfully.",
                "#2a9d8f"
            );

        }

        // =========================
        // CREATE
        // =========================

        else {

            const newVaccination = {

                vaccinationId:
                    generateVaccinationId(),

                ...formData

            };


            vaccinations.push(
                newVaccination
            );


            saveVaccinations();

            renderVaccinations();


            showVaccinationMessage(
                "Vaccination record added successfully.",
                "#2a9d8f"
            );

        }


        setTimeout(
            closeVaccinationDialog,
            600
        );

    }
);


// =========================
// TABLE ACTIONS
// =========================

vaccinationTableBody.addEventListener(
    "click",
    (event) => {

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

        if (
            action === "view"
        ) {

            alert(

                "VACCINATION RECORD\n\n" +

                `Vaccination ID: ${
                    vaccination.vaccinationId
                }\n` +

                `Pet: ${
                    petName
                }\n` +

                `Owner: ${
                    ownerName
                }\n` +

                `Vaccine: ${
                    vaccination.vaccineName
                }\n` +

                `Date Given: ${
                    vaccination.dateGiven
                }\n` +

                `Next Due Date: ${
                    vaccination.nextDueDate
                }\n` +

                `Veterinarian: ${
                    vaccination.veterinarian
                }\n` +

                `Status: ${
                    status
                }\n` +

                `Remarks: ${
                    vaccination.remarks ||
                    "None"
                }`

            );


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

        if (
            action === "delete"
        ) {

            const confirmed =
                confirm(

                    `Delete this vaccination record?\n\n` +

                    `Pet: ${petName}\n` +

                    `Vaccine: ${
                        vaccination.vaccineName
                    }`

                );


            if (!confirmed) {
                return;
            }


            vaccinations =
                vaccinations.filter(
                    item =>
                        item.vaccinationId !==
                        vaccinationId
                );


            saveVaccinations();

            renderVaccinations();

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


// =========================
// INITIALIZE
// =========================

populatePetDropdown();

renderVaccinations();