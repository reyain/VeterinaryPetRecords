// =========================
// SESSION / USER
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
// STORAGE KEY
// =========================

const OWNER_STORAGE_KEY =
    "vetPetOwners";


// =========================
// DEMO INITIAL RECORD
// =========================

const defaultOwners = [

    {
        ownerId: "OWN-0001",

        firstName: "Juan",

        middleName: "Dela",

        lastName: "Cruz",

        nameExtension: "",

        contactNumber: "09123456789",

        email: "juan@example.com",

        address: "Tacloban City",

        status: "Active"

    }

];


// =========================
// LOAD OWNERS
// =========================

function loadOwners() {

    const savedOwners =
        localStorage.getItem(
            OWNER_STORAGE_KEY
        );


    if (savedOwners) {

        try {

            const owners =
                JSON.parse(
                    savedOwners
                );


            if (Array.isArray(owners)) {
                return owners;
            }

        } catch (error) {

            console.error(
                "Unable to read saved owners:",
                error
            );

        }

    }


    localStorage.setItem(
        OWNER_STORAGE_KEY,
        JSON.stringify(defaultOwners)
    );


    return [...defaultOwners];

}


// =========================
// SAVE OWNERS
// =========================

function saveOwners() {

    localStorage.setItem(
        OWNER_STORAGE_KEY,
        JSON.stringify(owners)
    );

}


// =========================
// OWNER DATA
// =========================

let owners =
    loadOwners();


// =========================
// ELEMENTS
// =========================

const ownerTableBody =
    document.getElementById(
        "ownerTableBody"
    );

const ownerEmptyState =
    document.getElementById(
        "ownerEmptyState"
    );

const ownerSearch =
    document.getElementById(
        "ownerSearch"
    );

const totalOwnerCount =
    document.getElementById(
        "totalOwnerCount"
    );

const activeOwnerCount =
    document.getElementById(
        "activeOwnerCount"
    );

const inactiveOwnerCount =
    document.getElementById(
        "inactiveOwnerCount"
    );

const visibleOwnerCount =
    document.getElementById(
        "visibleOwnerCount"
    );


// =========================
// MODAL
// =========================

const ownerModal =
    document.getElementById(
        "ownerModal"
    );

const ownerForm =
    document.getElementById(
        "ownerForm"
    );

const modalTitle =
    document.getElementById(
        "modalTitle"
    );

const addOwnerButton =
    document.getElementById(
        "addOwnerButton"
    );

const closeOwnerModal =
    document.getElementById(
        "closeOwnerModal"
    );

const cancelOwnerButton =
    document.getElementById(
        "cancelOwnerButton"
    );

const saveOwnerButton =
    document.getElementById(
        "saveOwnerButton"
    );

const ownerFormMessage =
    document.getElementById(
        "ownerFormMessage"
    );


// =========================
// FORM FIELDS
// =========================

const firstName =
    document.getElementById(
        "firstName"
    );

const middleName =
    document.getElementById(
        "middleName"
    );

const lastName =
    document.getElementById(
        "lastName"
    );

const nameExtension =
    document.getElementById(
        "nameExtension"
    );

const contactNumber =
    document.getElementById(
        "contactNumber"
    );

const email =
    document.getElementById(
        "email"
    );

const address =
    document.getElementById(
        "address"
    );

const ownerStatus =
    document.getElementById(
        "ownerStatus"
    );


// =========================
// EDIT MODE
// =========================

let editingOwnerId = null;


// =========================
// OPEN ADD MODAL
// =========================

function openAddOwnerModal() {

    editingOwnerId = null;

    modalTitle.textContent =
        "Add New Owner";

    saveOwnerButton.textContent =
        "Save Owner";

    ownerForm.reset();

    ownerFormMessage.textContent =
        "";

    ownerFormMessage.style.color =
        "";

    ownerModal.classList.add(
        "show"
    );

    firstName.focus();

}


// =========================
// CLOSE MODAL
// =========================

function closeOwnerDialog() {

    ownerModal.classList.remove(
        "show"
    );

    ownerForm.reset();

    editingOwnerId = null;

    ownerFormMessage.textContent =
        "";

    ownerFormMessage.style.color =
        "";

}


// =========================
// MODAL EVENTS
// =========================

addOwnerButton.addEventListener(
    "click",
    openAddOwnerModal
);


closeOwnerModal.addEventListener(
    "click",
    closeOwnerDialog
);


cancelOwnerButton.addEventListener(
    "click",
    closeOwnerDialog
);


ownerModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            ownerModal
        ) {

            closeOwnerDialog();

        }

    }
);


// =========================
// CONTACT NUMBER
// =========================

contactNumber.addEventListener(
    "input",
    () => {

        contactNumber.value =
            contactNumber.value.replace(
                /\D/g,
                ""
            );

    }
);


// =========================
// OWNER NAME
// =========================

function buildFullName(owner) {

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
// INITIALS
// =========================

function getInitials(owner) {

    const first =
        owner.firstName
            ? owner.firstName.charAt(0)
            : "";

    const last =
        owner.lastName
            ? owner.lastName.charAt(0)
            : "";


    return (
        first + last
    ).toUpperCase();

}


// =========================
// ESCAPE HTML
// =========================

function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// =========================
// RENDER TABLE
// =========================

function renderOwners() {

    const searchValue =
        ownerSearch.value
            .toLowerCase()
            .trim();


    ownerTableBody.innerHTML =
        "";


    const filteredOwners =
        owners.filter(
            (owner) => {

                const searchableText =
                    [
                        owner.ownerId,
                        buildFullName(owner),
                        owner.contactNumber,
                        owner.email,
                        owner.address,
                        owner.status
                    ]
                    .join(" ")
                    .toLowerCase();


                return searchableText.includes(
                    searchValue
                );

            }
        );


    filteredOwners.forEach(
        (owner) => {

            const row =
                document.createElement(
                    "tr"
                );


            const escapedName =
                escapeHtml(
                    buildFullName(owner)
                );


            const escapedContact =
                escapeHtml(
                    owner.contactNumber
                );


            const escapedEmail =
                escapeHtml(
                    owner.email || "—"
                );


            const escapedAddress =
                escapeHtml(
                    owner.address
                );


            const escapedId =
                escapeHtml(
                    owner.ownerId
                );


            const escapedStatus =
                escapeHtml(
                    owner.status
                );


            const initials =
                escapeHtml(
                    getInitials(owner)
                );


            row.innerHTML = `

                <td>
                    ${escapedId}
                </td>


                <td>

                    <div class="owner-name-cell">

                        <div class="owner-avatar">
                            ${initials}
                        </div>


                        <div>

                            <strong>
                                ${escapedName}
                            </strong>

                            <small>
                                Registered Owner
                            </small>

                        </div>

                    </div>

                </td>


                <td>
                    ${escapedContact}
                </td>


                <td>
                    ${escapedEmail}
                </td>


                <td>
                    ${escapedAddress}
                </td>


                <td>

                    <span
                        class="
                            owner-status
                            ${
                                owner.status === "Active"
                                    ? "owner-active-status"
                                    : "owner-inactive-status"
                            }
                        "
                    >
                        ${escapedStatus}
                    </span>

                </td>


                <td>

                    <div class="owner-actions">

                        <button
                            type="button"
                            class="owner-action owner-view-action"
                            data-action="view"
                            data-id="${escapedId}"
                            title="View owner"
                        >
                            👁
                        </button>


                        <button
                            type="button"
                            class="owner-action owner-edit-action"
                            data-action="edit"
                            data-id="${escapedId}"
                            title="Edit owner"
                        >
                            ✎
                        </button>


                        <button
                            type="button"
                            class="owner-action owner-delete-action"
                            data-action="delete"
                            data-id="${escapedId}"
                            title="Delete owner"
                        >
                            🗑
                        </button>

                    </div>

                </td>

            `;


            ownerTableBody.appendChild(
                row
            );

        }
    );


    if (filteredOwners.length === 0) {

    ownerEmptyState.style.display =
        "block";

    } else {

        ownerEmptyState.style.display =
            "none";

    }


    visibleOwnerCount.textContent =
        filteredOwners.length;


    updateSummary();

}


// =========================
// SUMMARY
// =========================

function updateSummary() {

    const total =
        owners.length;


    const active =
        owners.filter(
            owner =>
                owner.status === "Active"
        ).length;


    const inactive =
        owners.filter(
            owner =>
                owner.status === "Inactive"
        ).length;


    totalOwnerCount.textContent =
        total;

    activeOwnerCount.textContent =
        active;

    inactiveOwnerCount.textContent =
        inactive;

}


// =========================
// GENERATE OWNER ID
// =========================

function generateOwnerId() {

    if (owners.length === 0) {

        return "OWN-0001";

    }


    const highestNumber =
        owners.reduce(
            (highest, owner) => {

                const number =
                    parseInt(
                        owner.ownerId
                            .replace("OWN-", ""),
                        10
                    );


                return Number.isNaN(number)
                    ? highest
                    : Math.max(
                        highest,
                        number
                    );

            },
            0
        );


    return `OWN-${String(
        highestNumber + 1
    ).padStart(4, "0")}`;

}


// =========================
// READ FORM
// =========================

function getFormData() {

    return {

        firstName:
            firstName.value.trim(),

        middleName:
            middleName.value.trim(),

        lastName:
            lastName.value.trim(),

        nameExtension:
            nameExtension.value,

        contactNumber:
            contactNumber.value.trim(),

        email:
            email.value.trim(),

        address:
            address.value.trim(),

        status:
            ownerStatus.value

    };

}


// =========================
// VALIDATE FORM
// =========================

function validateOwner(owner) {

    if (!owner.firstName) {

        return "First name is required.";

    }


    if (!owner.lastName) {

        return "Last name is required.";

    }


    if (
        !/^\d{11}$/.test(
            owner.contactNumber
        )
    ) {

        return (
            "Contact number must contain " +
            "exactly 11 digits."
        );

    }


    if (
        owner.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            owner.email
        )
    ) {

        return "Please enter a valid email address.";

    }


    if (!owner.address) {

        return "Complete address is required.";

    }


    return null;

}


// =========================
// CREATE / UPDATE
// =========================

ownerForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        const formData =
            getFormData();


        const validationError =
            validateOwner(
                formData
            );


        if (validationError) {

            ownerFormMessage.textContent =
                validationError;

            ownerFormMessage.style.color =
                "#c0392b";

            return;

        }


        // =========================
        // UPDATE
        // =========================

        if (editingOwnerId) {

            const ownerIndex =
                owners.findIndex(
                    owner =>
                        owner.ownerId ===
                        editingOwnerId
                );


            if (ownerIndex === -1) {

                ownerFormMessage.textContent =
                    "Owner record could not be found.";

                ownerFormMessage.style.color =
                    "#c0392b";

                return;

            }


            owners[ownerIndex] = {

                ...owners[ownerIndex],

                ...formData

            };


            saveOwners();

            renderOwners();


            ownerFormMessage.textContent =
                "Owner record updated successfully.";

            ownerFormMessage.style.color =
                "#2a9d8f";


        }

        // =========================
        // CREATE
        // =========================

        else {

            const newOwner = {

                ownerId:
                    generateOwnerId(),

                ...formData

            };


            owners.push(
                newOwner
            );


            saveOwners();

            renderOwners();


            ownerFormMessage.textContent =
                "Owner record added successfully.";

            ownerFormMessage.style.color =
                "#2a9d8f";

        }


        setTimeout(
            closeOwnerDialog,
            600
        );

    }
);


// =========================
// TABLE ACTIONS
// =========================

ownerTableBody.addEventListener(
    "click",
    (event) => {

        const button =
            event.target.closest(
                ".owner-action"
            );


        if (!button) {
            return;
        }


        const ownerId =
            button.dataset.id;


        const action =
            button.dataset.action;


        const owner =
            owners.find(
                item =>
                    item.ownerId ===
                    ownerId
            );


        if (!owner) {
            return;
        }


        // =========================
        // VIEW
        // =========================

        if (action === "view") {

            alert(

                "OWNER DETAILS\n\n" +

                `Owner ID: ${owner.ownerId}\n` +

                `Name: ${buildFullName(owner)}\n` +

                `Contact: ${owner.contactNumber}\n` +

                `Email: ${
                    owner.email || "None"
                }\n` +

                `Address: ${owner.address}\n` +

                `Status: ${owner.status}`

            );


            return;

        }


        // =========================
        // EDIT
        // =========================

        if (action === "edit") {

            editingOwnerId =
                owner.ownerId;


            modalTitle.textContent =
                "Edit Owner";


            saveOwnerButton.textContent =
                "Update Owner";


            firstName.value =
                owner.firstName;

            middleName.value =
                owner.middleName;

            lastName.value =
                owner.lastName;

            nameExtension.value =
                owner.nameExtension;

            contactNumber.value =
                owner.contactNumber;

            email.value =
                owner.email;

            address.value =
                owner.address;

            ownerStatus.value =
                owner.status;


            ownerFormMessage.textContent =
                "";

            ownerFormMessage.style.color =
                "";


            ownerModal.classList.add(
                "show"
            );


            firstName.focus();


            return;

        }


        // =========================
        // DELETE
        // =========================

        if (action === "delete") {

            const confirmed =
                confirm(

                    `Delete owner record?\n\n` +
                    `${buildFullName(owner)}`

                );


            if (!confirmed) {
                return;
            }


            owners =
                owners.filter(
                    item =>
                        item.ownerId !==
                        ownerId
                );


            saveOwners();

            renderOwners();

        }

    }
);


// =========================
// SEARCH
// =========================

ownerSearch.addEventListener(
    "input",
    renderOwners
);


// =========================
// INITIAL RENDER
// =========================

renderOwners();