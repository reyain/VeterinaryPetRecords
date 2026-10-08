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

const OWNER_STORAGE_KEY =
    "vetPetOwners";

const PET_STORAGE_KEY =
    "vetPetPets";

const MEDICAL_STORAGE_KEY =
    "vetPetMedicalRecords";

const VACCINATION_STORAGE_KEY =
    "vetPetVaccinations";


// =========================
// SAFE ARRAY LOADER
// =========================

function loadArray(
    storageKey
) {

    const saved =
        localStorage.getItem(
            storageKey
        );


    if (!saved) {
        return [];
    }


    try {

        const parsed =
            JSON.parse(
                saved
            );


        return Array.isArray(parsed)
            ? parsed
            : [];

    } catch (error) {

        console.error(
            `Unable to load ${storageKey}:`,
            error
        );

        return [];

    }

}


// =========================
// LOAD ALL DATA
// =========================

function loadReportData() {

    return {

        owners:
            loadArray(
                OWNER_STORAGE_KEY
            ),

        pets:
            loadArray(
                PET_STORAGE_KEY
            ),

        medical:
            loadArray(
                MEDICAL_STORAGE_KEY
            ),

        vaccinations:
            loadArray(
                VACCINATION_STORAGE_KEY
            )

    };

}


let reportData =
    loadReportData();


// =========================
// ELEMENTS
// =========================

const reportType =
    document.getElementById(
        "reportType"
    );

const reportStartDate =
    document.getElementById(
        "reportStartDate"
    );

const reportEndDate =
    document.getElementById(
        "reportEndDate"
    );

const generateReportButton =
    document.getElementById(
        "generateReportButton"
    );

const resetReportButton =
    document.getElementById(
        "resetReportButton"
    );

const refreshReportButton =
    document.getElementById(
        "refreshReportButton"
    );

const printReportButton =
    document.getElementById(
        "printReportButton"
    );

const reportMessage =
    document.getElementById(
        "reportMessage"
    );

const reportTableBody =
    document.getElementById(
        "reportTableBody"
    );


// =========================
// PET LOOKUP
// =========================

function getPet(
    petId,
    pets
) {

    return pets.find(
        pet =>
            pet.petId === petId
    );

}


// =========================
// VACCINATION STATUS
// =========================

function calculateVaccinationStatus(
    nextDueDate
) {

    if (!nextDueDate) {

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
            `${nextDueDate}T00:00:00`
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
// DATE FILTER
// =========================

function isWithinDateRange(
    value,
    startDate,
    endDate
) {

    if (!value) {

        return true;

    }


    if (!startDate && !endDate) {

        return true;

    }


    if (
        startDate &&
        value < startDate
    ) {

        return false;

    }


    if (
        endDate &&
        value > endDate
    ) {

        return false;

    }


    return true;

}


// =========================
// FILTER DATA
// =========================

function getFilteredData() {

    const startDate =
        reportStartDate.value;

    const endDate =
        reportEndDate.value;


    return {

        owners:
            reportData.owners.filter(
                owner =>
                    isWithinDateRange(
                        null,
                        startDate,
                        endDate
                    )
            ),

        pets:
            reportData.pets.filter(
                pet =>
                    isWithinDateRange(
                        null,
                        startDate,
                        endDate
                    )
            ),

        medical:
            reportData.medical.filter(
                record =>
                    isWithinDateRange(
                        record.recordDate,
                        startDate,
                        endDate
                    )
            ),

        vaccinations:
            reportData.vaccinations.filter(
                vaccination =>
                    isWithinDateRange(
                        vaccination.dateGiven,
                        startDate,
                        endDate
                    )
            )

    };

}


// =========================
// UPDATE SUMMARY
// =========================

function updateSummary() {

    reportData =
        loadReportData();


    const filtered =
        getFilteredData();


    document.getElementById(
        "reportOwnerCount"
    ).textContent =
        filtered.owners.length;


    document.getElementById(
        "reportPetCount"
    ).textContent =
        filtered.pets.length;


    document.getElementById(
        "reportMedicalCount"
    ).textContent =
        filtered.medical.length;


    document.getElementById(
        "reportVaccinationCount"
    ).textContent =
        filtered.vaccinations.length;


    document.getElementById(
        "ownerBarValue"
    ).textContent =
        filtered.owners.length;


    document.getElementById(
        "petBarValue"
    ).textContent =
        filtered.pets.length;


    document.getElementById(
        "medicalBarValue"
    ).textContent =
        filtered.medical.length;


    document.getElementById(
        "vaccinationBarValue"
    ).textContent =
        filtered.vaccinations.length;


    updateBars(
        filtered
    );


    updateVaccinationSummary(
        filtered.vaccinations
    );

}


// =========================
// UPDATE BARS
// =========================

function updateBars(
    filtered
) {

    const values = [

        filtered.owners.length,

        filtered.pets.length,

        filtered.medical.length,

        filtered.vaccinations.length

    ];


    const maximum =
        Math.max(
            ...values,
            1
        );


    document.getElementById(
        "ownerBar"
    ).style.width =
        `${(
            filtered.owners.length /
            maximum
        ) * 100}%`;


    document.getElementById(
        "petBar"
    ).style.width =
        `${(
            filtered.pets.length /
            maximum
        ) * 100}%`;


    document.getElementById(
        "medicalBar"
    ).style.width =
        `${(
            filtered.medical.length /
            maximum
        ) * 100}%`;


    document.getElementById(
        "vaccinationBar"
    ).style.width =
        `${(
            filtered.vaccinations.length /
            maximum
        ) * 100}%`;

}


// =========================
// VACCINATION SUMMARY
// =========================

function updateVaccinationSummary(
    vaccinations
) {

    let upToDate =
        0;

    let dueSoon =
        0;

    let overdue =
        0;


    vaccinations.forEach(
        vaccination => {

            const status =
                calculateVaccinationStatus(
                    vaccination.nextDueDate
                );


            if (
                status ===
                "Up to Date"
            ) {

                upToDate++;

            }


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


    document.getElementById(
        "upToDateCount"
    ).textContent =
        `${upToDate} record${
            upToDate === 1
                ? ""
                : "s"
        }`;


    document.getElementById(
        "dueSoonCount"
    ).textContent =
        `${dueSoon} record${
            dueSoon === 1
                ? ""
                : "s"
        }`;


    document.getElementById(
        "overdueCount"
    ).textContent =
        `${overdue} record${
            overdue === 1
                ? ""
                : "s"
        }`;

}


// =========================
// REPORT TITLE
// =========================

function getReportTitle() {

    switch (
        reportType.value
    ) {

        case "owners":
            return "Owner Report";

        case "pets":
            return "Pet Report";

        case "medical":
            return "Medical Records Report";

        case "vaccinations":
            return "Vaccination Report";

        default:
            return "Overall System Report";

    }

}


// =========================
// REPORT DATE DESCRIPTION
// =========================

function getDateDescription() {

    const start =
        reportStartDate.value;

    const end =
        reportEndDate.value;


    if (
        start &&
        end
    ) {

        return (
            `Report period: ${start} to ${end}.`
        );

    }


    if (start) {

        return (
            `Report period starting ${start}.`
        );

    }


    if (end) {

        return (
            `Report period ending ${end}.`
        );

    }


    return (
        "Current summary of the veterinary pet records system."
    );

}


// =========================
// REPORT STATUS CLASS
// =========================

function getReportStatusClass(
    status
) {

    if (
        status ===
        "Attention"
    ) {

        return "report-table-attention";

    }


    if (
        status ===
        "Overdue"
    ) {

        return "report-table-danger";

    }


    return "";

}


// =========================
// BUILD REPORT ROW
// =========================

function addReportRow(
    category,
    count,
    status,
    remarks
) {

    const row =
        document.createElement(
            "tr"
        );


    const statusClass =
        getReportStatusClass(
            status
        );


    row.innerHTML = `

        <td></td>

        <td></td>

        <td>

            <span
                class="
                    report-table-status
                    ${statusClass}
                "
            ></span>

        </td>

        <td></td>

    `;


    row.cells[0].textContent =
        category;

    row.cells[1].textContent =
        count;


    row.cells[2]
        .querySelector("span")
        .textContent =
        status;


    row.cells[3].textContent =
        remarks;


    reportTableBody.appendChild(
        row
    );

}


// =========================
// BUILD REPORT
// =========================

function buildReport() {

    reportData =
        loadReportData();


    const filtered =
        getFilteredData();


    reportTableBody.innerHTML =
        "";


    const selectedType =
        reportType.value;


    if (
        selectedType ===
        "overview"
    ) {

        addReportRow(
            "Owners",
            filtered.owners.length,
            "Available",
            "Registered pet owner records"
        );


        addReportRow(
            "Pets",
            filtered.pets.length,
            "Available",
            "Registered pet records"
        );


        addReportRow(
            "Medical Records",
            filtered.medical.length,
            "Available",
            "Recorded veterinary medical history"
        );


        addReportRow(
            "Vaccinations",
            filtered.vaccinations.length,
            "Available",
            "Recorded vaccination history"
        );

    }


    if (
        selectedType ===
        "owners"
    ) {

        addReportRow(
            "Pet Owners",
            filtered.owners.length,
            "Available",
            "Registered owner records"
        );

    }


    if (
        selectedType ===
        "pets"
    ) {

        addReportRow(
            "Registered Pets",
            filtered.pets.length,
            "Available",
            "Registered pet records"
        );

    }


    if (
        selectedType ===
        "medical"
    ) {

        addReportRow(
            "Medical Records",
            filtered.medical.length,
            "Available",
            "Recorded medical history"
        );

    }


    if (
        selectedType ===
        "vaccinations"
    ) {

        let upToDate =
            0;

        let dueSoon =
            0;

        let overdue =
            0;


        filtered.vaccinations.forEach(
            vaccination => {

                const status =
                    calculateVaccinationStatus(
                        vaccination.nextDueDate
                    );


                if (
                    status ===
                    "Up to Date"
                ) {

                    upToDate++;

                }


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


        addReportRow(
            "Vaccinations",
            filtered.vaccinations.length,
            "Available",
            "Recorded vaccination history"
        );


        addReportRow(
            "Up to Date",
            upToDate,
            "Current",
            "Vaccinations currently up to date"
        );


        addReportRow(
            "Due Soon",
            dueSoon,
            "Attention",
            "Vaccinations approaching their due date"
        );


        addReportRow(
            "Overdue",
            overdue,
            "Overdue",
            "Vaccinations past their due date"
        );

    }


    document.getElementById(
        "generatedReportTitle"
    ).textContent =
        getReportTitle();


    document.getElementById(
        "generatedReportDescription"
    ).textContent =
        getDateDescription();


    document.getElementById(
        "generatedDate"
    ).textContent =
        new Date().toLocaleString();


    updateSummary();

}


// =========================
// GENERATE BUTTON
// =========================

generateReportButton.addEventListener(
    "click",
    () => {

        const startDate =
            reportStartDate.value;

        const endDate =
            reportEndDate.value;


        if (
            startDate &&
            endDate &&
            startDate > endDate
        ) {

            reportMessage.textContent =
                "Start date cannot be later than the end date.";

            reportMessage.style.color =
                "#c0392b";

            return;

        }


        buildReport();


        reportMessage.textContent =
            `${getReportTitle()} generated successfully.`;


        reportMessage.style.color =
            "#2a9d8f";

    }
);


// =========================
// RESET
// =========================

resetReportButton.addEventListener(
    "click",
    () => {

        reportType.value =
            "overview";

        reportStartDate.value =
            "";

        reportEndDate.value =
            "";

        reportMessage.textContent =
            "";

        buildReport();

    }
);


// =========================
// REFRESH
// =========================

refreshReportButton.addEventListener(
    "click",
    () => {

        reportData =
            loadReportData();

        buildReport();


        reportMessage.textContent =
            "Report data refreshed successfully.";

        reportMessage.style.color =
            "#2a9d8f";

    }
);


// =========================
// PRINT
// =========================

printReportButton.addEventListener(
    "click",
    () => {

        window.print();

    }
);


// =========================
// INITIALIZE
// =========================

buildReport();