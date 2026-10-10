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

if (username && role) {

    const displayName =
        username.charAt(0).toUpperCase()
        + username.slice(1);


    document.getElementById(
        "userName"
    ).textContent =
        displayName;


    document.getElementById(
        "userRole"
    ).textContent =
        role;


    document.getElementById(
        "userAvatar"
    ).textContent =
        displayName.charAt(0).toUpperCase();

}


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


if (logoutButton) {

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

}


// =========================
// STORAGE
// =========================

const OWNER_STORAGE_KEY =
    "vetPetOwners";

const PET_STORAGE_KEY =
    "vetPetPets";


// =========================
// PET DATA
// =========================

function loadPets() {

    const savedPets =
        localStorage.getItem(
            PET_STORAGE_KEY
        );


    if (savedPets) {

        try {

            const parsedPets =
                JSON.parse(
                    savedPets
                );


            if (Array.isArray(parsedPets)) {

                return parsedPets;

            }

        } catch (error) {

            console.error(
                "Unable to load saved pets:",
                error
            );

        }

    }


    localStorage.setItem(
        PET_STORAGE_KEY,
        JSON.stringify([])
    );


    return [];

}


let pets =
    loadPets();


// =========================
// OWNER DATA
// =========================

function loadOwners() {

    const savedOwners =
        localStorage.getItem(
            OWNER_STORAGE_KEY
        );


    if (!savedOwners) {

        return [];

    }


    try {

        const parsedOwners =
            JSON.parse(
                savedOwners
            );


        return Array.isArray(parsedOwners)
            ? parsedOwners
            : [];

    } catch (error) {

        console.error(
            "Unable to load owners:",
            error
        );

        return [];

    }

}


let owners =
    loadOwners();


// =========================
// ELEMENTS
// =========================

const petTableBody =
    document.getElementById(
        "petTableBody"
    );

const petEmptyState =
    document.getElementById(
        "petEmptyState"
    );

const petSearch =
    document.getElementById(
        "petSearch"
    );

const totalPetCount =
    document.getElementById(
        "totalPetCount"
    );

const activePetCount =
    document.getElementById(
        "activePetCount"
    );

const inactivePetCount =
    document.getElementById(
        "inactivePetCount"
    );

const visiblePetCount =
    document.getElementById(
        "visiblePetCount"
    );


// =========================
// MODAL
// =========================

const petModal =
    document.getElementById(
        "petModal"
    );

const petForm =
    document.getElementById(
        "petForm"
    );

const modalTitle =
    document.getElementById(
        "modalTitle"
    );

const addPetButton =
    document.getElementById(
        "addPetButton"
    );

const closePetModal =
    document.getElementById(
        "closePetModal"
    );

const cancelPetButton =
    document.getElementById(
        "cancelPetButton"
    );

const savePetButton =
    document.getElementById(
        "savePetButton"
    );

const petFormMessage =
    document.getElementById(
        "petFormMessage"
    );


// =========================
// FORM FIELDS
// =========================

const petName =
    document.getElementById(
        "petName"
    );

const ownerSelect =
    document.getElementById(
        "ownerSelect"
    );

const species =
    document.getElementById(
        "species"
    );

const breed =
    document.getElementById(
        "breed"
    );

const sex =
    document.getElementById(
        "sex"
    );

const birthDate =
    document.getElementById(
        "birthDate"
    );

const registrationStatus =
    document.getElementById(
        "registrationStatus"
    );


// =========================
// EDIT MODE
// =========================

let editingPetId = null;


// =========================
// OWNER HELPERS
// =========================

function getOwnerName(ownerId) {

    const owner =
        owners.find(
            item =>
                item.ownerId === ownerId
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

}


// =========================
// POPULATE OWNER DROPDOWN
// =========================

function populateOwnerDropdown(
    selectedOwnerId = ""
) {

    owners =
        loadOwners();


    ownerSelect.innerHTML = "";


    const defaultOption =
        document.createElement(
            "option"
        );

    defaultOption.value =
        "";

    defaultOption.textContent =
        owners.length > 0
            ? "Select Owner"
            : "No registered owners available";

    ownerSelect.appendChild(
        defaultOption
    );


    owners.forEach(
        (owner) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                owner.ownerId;


            option.textContent =
                `${owner.ownerId} — ${
                    getOwnerName(
                        owner.ownerId
                    )
                }`;


            if (
                owner.ownerId ===
                selectedOwnerId
            ) {

                option.selected =
                    true;

            }


            ownerSelect.appendChild(
                option
            );

        }
    );

}


// =========================
// PET ICON
// =========================

function getPetIcon(
    petSpecies
) {

    switch (
        petSpecies
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
// SAVE
// =========================

function savePets() {

    localStorage.setItem(
        PET_STORAGE_KEY,
        JSON.stringify(pets)
    );

}


// =========================
// PET ID
// =========================

function generatePetId() {

    if (pets.length === 0) {

        return "PET-0001";

    }


    const highestNumber =
        pets.reduce(
            (
                highest,
                pet
            ) => {

                const number =
                    parseInt(
                        pet.petId
                            .replace(
                                "PET-",
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


    return `PET-${String(
        highestNumber + 1
    ).padStart(4, "0")}`;

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
// RENDER
// =========================

function renderPets() {

    owners =
        loadOwners();


    const searchValue =
        petSearch.value
            .toLowerCase()
            .trim();


    petTableBody.innerHTML =
        "";


    const filteredPets =
        pets.filter(
            (pet) => {

                const ownerName =
                    getOwnerName(
                        pet.ownerId
                    );


                const searchableText =
                    [
                        pet.petId,
                        pet.petName,
                        ownerName,
                        pet.species,
                        pet.breed,
                        pet.sex,
                        pet.birthDate,
                        pet.status
                    ]
                    .join(" ")
                    .toLowerCase();


                return searchableText.includes(
                    searchValue
                );

            }
        );


    filteredPets.forEach(
        (pet) => {

            const row =
                document.createElement(
                    "tr"
                );


            const escapedPetId =
                escapeHtml(
                    pet.petId
                );


            const escapedPetName =
                escapeHtml(
                    pet.petName
                );


            const escapedOwnerName =
                escapeHtml(
                    getOwnerName(
                        pet.ownerId
                    )
                );


            const escapedSpecies =
                escapeHtml(
                    pet.species
                );


            const escapedBreed =
                escapeHtml(
                    pet.breed
                );


            const escapedSex =
                escapeHtml(
                    pet.sex
                );


            const escapedBirthDate =
                escapeHtml(
                    pet.birthDate ||
                    "—"
                );


            const escapedStatus =
                escapeHtml(
                    pet.status
                );


            const icon =
                getPetIcon(
                    pet.species
                );


            row.innerHTML = `

                <td>
                    ${escapedPetId}
                </td>


                <td>

                    <div class="pet-name-cell">

                        <div class="pet-avatar">
                            ${icon}
                        </div>

                        <div>

                            <strong>
                                ${escapedPetName}
                            </strong>

                            <small>
                                Registered Pet
                            </small>

                        </div>

                    </div>

                </td>


                <td>
                    ${escapedOwnerName}
                </td>


                <td>
                    ${escapedSpecies}
                </td>


                <td>
                    ${escapedBreed}
                </td>


                <td>
                    ${escapedSex}
                </td>


                <td>
                    ${escapedBirthDate}
                </td>


                <td>

                    <span
                        class="
                            pet-status
                            ${
                                pet.status === "Active"
                                    ? "pet-active-status"
                                    : "pet-inactive-status"
                            }
                        "
                    >
                        ${escapedStatus}
                    </span>

                </td>


                <td>

                    <div class="pet-actions">

                        <button
                            type="button"
                            class="pet-action pet-view-action"
                            data-action="view"
                            data-id="${escapedPetId}"
                            title="View pet"
                        >
                            👁
                        </button>


                        <button
                            type="button"
                            class="pet-action pet-edit-action"
                            data-action="edit"
                            data-id="${escapedPetId}"
                            title="Edit pet"
                        >
                            ✎
                        </button>


                        <button
                            type="button"
                            class="pet-action pet-delete-action"
                            data-action="delete"
                            data-id="${escapedPetId}"
                            title="Delete pet"
                        >
                            🗑
                        </button>

                    </div>

                </td>

            `;


            petTableBody.appendChild(
                row
            );

        }
    );


    if (
        filteredPets.length === 0
    ) {

        petEmptyState.style.display =
            "block";

    } else {

        petEmptyState.style.display =
            "none";

    }


    visiblePetCount.textContent =
        filteredPets.length;


    updateSummary();

}


// =========================
// SUMMARY
// =========================

function updateSummary() {

    const total =
        pets.length;


    const active =
        pets.filter(
            pet =>
                pet.status === "Active"
        ).length;


    const inactive =
        pets.filter(
            pet =>
                pet.status === "Inactive"
        ).length;


    totalPetCount.textContent =
        total;

    activePetCount.textContent =
        active;

    inactivePetCount.textContent =
        inactive;

}


// =========================
// OPEN ADD
// =========================

function openAddPetModal() {

    editingPetId =
        null;


    modalTitle.textContent =
        "Register New Pet";


    savePetButton.textContent =
        "Register Pet";


    petForm.reset();


    registrationStatus.value =
        "Active";


    populateOwnerDropdown();


    petFormMessage.textContent =
        "";

    petFormMessage.style.color =
        "";


    petModal.classList.add(
        "show"
    );


    petName.focus();

}


// =========================
// OPEN EDIT
// =========================

function openEditPetModal(
    pet
) {

    editingPetId =
        pet.petId;


    modalTitle.textContent =
        "Edit Pet";


    savePetButton.textContent =
        "Update Pet";


    populateOwnerDropdown(
        pet.ownerId
    );


    petName.value =
        pet.petName;

    ownerSelect.value =
        pet.ownerId;

    species.value =
        pet.species;

    breed.value =
        pet.breed;

    sex.value =
        pet.sex;

    birthDate.value =
        pet.birthDate || "";

    registrationStatus.value =
        pet.status;


    petFormMessage.textContent =
        "";

    petFormMessage.style.color =
        "";


    petModal.classList.add(
        "show"
    );


    petName.focus();

}


// =========================
// CLOSE MODAL
// =========================

function closePetDialog() {

    petModal.classList.remove(
        "show"
    );


    petForm.reset();


    editingPetId =
        null;


    petFormMessage.textContent =
        "";

    petFormMessage.style.color =
        "";

}


// =========================
// OPEN/CLOSE EVENTS
// =========================

addPetButton.addEventListener(
    "click",
    openAddPetModal
);


closePetModal.addEventListener(
    "click",
    closePetDialog
);


cancelPetButton.addEventListener(
    "click",
    closePetDialog
);


petModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            petModal
        ) {

            closePetDialog();

        }

    }
);


// =========================
// FORM VALIDATION
// =========================

function validatePet(
    pet
) {

    if (!pet.petName) {

        return (
            "Pet name is required."
        );

    }


    if (!pet.ownerId) {

        return (
            "Please select an owner."
        );

    }


    if (!pet.species) {

        return (
            "Please select the pet species."
        );

    }


    if (!pet.breed) {

        return (
            "Breed is required."
        );

    }


    if (!pet.sex) {

        return (
            "Please select the pet's sex."
        );

    }


    return null;

}


// =========================
// FORM DATA
// =========================

function getPetFormData() {

    return {

        petName:
            petName.value.trim(),

        ownerId:
            ownerSelect.value,

        species:
            species.value,

        breed:
            breed.value.trim(),

        sex:
            sex.value,

        birthDate:
            birthDate.value,

        status:
            registrationStatus.value

    };

}


// =========================
// CREATE / UPDATE
// =========================

petForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        const formData =
            getPetFormData();


        const validationError =
            validatePet(
                formData
            );


        if (validationError) {

            petFormMessage.textContent =
                validationError;

            petFormMessage.style.color =
                "#c0392b";

            return;

        }


        // =========================
        // UPDATE
        // =========================

        if (editingPetId) {

            const petIndex =
                pets.findIndex(
                    pet =>
                        pet.petId ===
                        editingPetId
                );


            if (petIndex === -1) {

                petFormMessage.textContent =
                    "Pet record could not be found.";

                petFormMessage.style.color =
                    "#c0392b";

                return;

            }


            pets[petIndex] = {

                ...pets[petIndex],

                ...formData

            };


            savePets();

            renderPets();


            petFormMessage.textContent =
                "Pet record updated successfully.";

            petFormMessage.style.color =
                "#2a9d8f";

        }

        // =========================
        // CREATE
        // =========================

        else {

            const newPet = {

                petId:
                    generatePetId(),

                ...formData

            };


            pets.push(
                newPet
            );


            savePets();

            renderPets();


            petFormMessage.textContent =
                "Pet registered successfully.";

            petFormMessage.style.color =
                "#2a9d8f";

        }


        setTimeout(
            closePetDialog,
            600
        );

    }
);


// =========================
// TABLE ACTIONS
// =========================

petTableBody.addEventListener(
    "click",
    (event) => {

        const button =
            event.target.closest(
                ".pet-action"
            );


        if (!button) {
            return;
        }


        const petId =
            button.dataset.id;


        const action =
            button.dataset.action;


        const pet =
            pets.find(
                item =>
                    item.petId ===
                    petId
            );


        if (!pet) {
            return;
        }


        // =========================
        // VIEW
        // =========================

        if (
            action === "view"
        ) {

            alert(

                "PET DETAILS\n\n" +

                `Pet ID: ${pet.petId}\n` +

                `Pet Name: ${pet.petName}\n` +

                `Owner: ${
                    getOwnerName(
                        pet.ownerId
                    )
                }\n` +

                `Species: ${pet.species}\n` +

                `Breed: ${pet.breed}\n` +

                `Sex: ${pet.sex}\n` +

                `Birth Date: ${
                    pet.birthDate || "None"
                }\n` +

                `Status: ${pet.status}`

            );


            return;

        }


        // =========================
        // EDIT
        // =========================

        if (
            action === "edit"
        ) {

            openEditPetModal(
                pet
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

                    `Delete pet record?\n\n` +

                    `${pet.petName}\n` +

                    `Owner: ${
                        getOwnerName(
                            pet.ownerId
                        )
                    }`

                );


            if (!confirmed) {
                return;
            }


            pets =
                pets.filter(
                    item =>
                        item.petId !==
                        petId
                );


            savePets();

            renderPets();

        }

    }
);


// =========================
// SEARCH
// =========================

petSearch.addEventListener(
    "input",
    renderPets
);


// =========================
// INITIALIZE
// =========================

populateOwnerDropdown();

renderPets();