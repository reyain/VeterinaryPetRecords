/* =========================================================
   SERVER CONFIGURATION
   Temporary frontend configuration interface
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       ADMIN SESSION
       ===================================================== */

    const currentUser = JSON.parse(
        sessionStorage.getItem(
            "vetCurrentUser"
        )
    );


    if (
        !currentUser ||
        currentUser.role !== "Administrator"
    ) {

        window.location.href =
            "../../index.html";

        return;
    }


    /* =====================================================
       USER DISPLAY
       ===================================================== */

    const userName =
        document.getElementById(
            "userName"
        );

    const userRole =
        document.getElementById(
            "userRole"
        );

    const userAvatar =
        document.getElementById(
            "userAvatar"
        );


    const administratorName =
        currentUser.fullName ||
        currentUser.username ||
        "Administrator";


    userName.textContent =
        administratorName;

    userRole.textContent =
        "Administrator";

    userAvatar.textContent =
        administratorName
            .charAt(0)
            .toUpperCase();


    /* =====================================================
       FORM ELEMENTS
       ===================================================== */

    const serverHost =
        document.getElementById(
            "serverHost"
        );

    const serverPort =
        document.getElementById(
            "serverPort"
        );

    const lanAccess =
        document.getElementById(
            "lanAccess"
        );

    const applicationName =
        document.getElementById(
            "applicationName"
        );


    const databaseHost =
        document.getElementById(
            "databaseHost"
        );

    const databasePort =
        document.getElementById(
            "databasePort"
        );

    const databaseName =
        document.getElementById(
            "databaseName"
        );

    const databaseUsername =
        document.getElementById(
            "databaseUsername"
        );

    const databasePassword =
        document.getElementById(
            "databasePassword"
        );


    const clientAccessUrl =
        document.getElementById(
            "clientAccessUrl"
        );


    const saveButton =
        document.getElementById(
            "saveConfigurationButton"
        );

    const resetButton =
        document.getElementById(
            "resetConfigurationButton"
        );

    const message =
        document.getElementById(
            "configurationMessage"
        );


    /* =====================================================
       SUMMARY ELEMENTS
       ===================================================== */

    const webServerStatus =
        document.getElementById(
            "webServerStatus"
        );

    const databaseStatus =
        document.getElementById(
            "databaseStatus"
        );

    const lanStatus =
        document.getElementById(
            "lanStatus"
        );

    const serverStatusText =
        document.getElementById(
            "serverStatusText"
        );

    const serverStatusIndicator =
        document.getElementById(
            "serverStatusIndicator"
        );


    /* =====================================================
       STORAGE
       ===================================================== */

    const STORAGE_KEY =
        "vetServerConfiguration";


    /* =====================================================
       DEFAULT CONFIGURATION
       ===================================================== */

    const defaultConfiguration = {

        serverHost:
            "localhost",

        serverPort:
            "3000",

        lanAccess:
            "enabled",

        applicationName:
            "Veterinary Pet Records System",

        databaseHost:
            "127.0.0.1",

        databasePort:
            "3306",

        databaseName:
            "veterinary_pet_records",

        databaseUsername:
            "root",

        databasePassword:
            ""

    };


    /* =====================================================
       LOAD CONFIGURATION
       ===================================================== */

    function loadConfiguration() {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!saved) {

            return {
                ...defaultConfiguration
            };

        }


        try {

            return {
                ...defaultConfiguration,
                ...JSON.parse(saved)
            };

        } catch (error) {

            console.error(
                "Unable to load server configuration:",
                error
            );


            return {
                ...defaultConfiguration
            };

        }

    }


    /* =====================================================
       UPDATE URL
       ===================================================== */

    function updateClientAccessUrl() {

        const host =
            serverHost.value
                .trim() ||
            "localhost";


        const port =
            serverPort.value
                .trim() ||
            "3000";


        const protocol =
            window.location.protocol ===
            "https:"
                ? "https"
                : "http";


        clientAccessUrl.textContent =
            `${protocol}://${host}:${port}`;
    }


    /* =====================================================
       DISPLAY CONFIGURATION
       ===================================================== */

    function displayConfiguration() {

        const config =
            loadConfiguration();


        serverHost.value =
            config.serverHost;

        serverPort.value =
            config.serverPort;

        lanAccess.value =
            config.lanAccess;

        applicationName.value =
            config.applicationName;


        databaseHost.value =
            config.databaseHost;

        databasePort.value =
            config.databasePort;

        databaseName.value =
            config.databaseName;

        databaseUsername.value =
            config.databaseUsername;

        databasePassword.value =
            config.databasePassword;


        updateClientAccessUrl();


        webServerStatus.textContent =
            "Running";


        databaseStatus.textContent =
            "Not Connected";


        lanStatus.textContent =
            config.lanAccess ===
            "enabled"
                ? "Enabled"
                : "Disabled";


        serverStatusText.textContent =
            "Running";


        serverStatusIndicator.style.background =
            "#35a866";

    }


    /* =====================================================
       VALIDATE PORT
       ===================================================== */

    function isValidPort(
        value
    ) {

        const port =
            Number(value);


        return (
            Number.isInteger(port) &&
            port >= 1 &&
            port <= 65535
        );
    }


    /* =====================================================
       SAVE CONFIGURATION
       ===================================================== */

    saveButton.addEventListener(
        "click",
        () => {

            const host =
                serverHost.value.trim();

            const port =
                serverPort.value.trim();

            const appName =
                applicationName.value.trim();


            const dbHost =
                databaseHost.value.trim();

            const dbPort =
                databasePort.value.trim();

            const dbName =
                databaseName.value.trim();

            const dbUsername =
                databaseUsername.value.trim();


            if (!host) {

                showError(
                    "Please enter the Server Host or IP Address."
                );

                return;
            }


            if (
                !isValidPort(port)
            ) {

                showError(
                    "Server Port must be between 1 and 65535."
                );

                return;
            }


            if (!appName) {

                showError(
                    "Please enter the application name."
                );

                return;
            }


            if (!dbHost) {

                showError(
                    "Please enter the Database Host."
                );

                return;
            }


            if (
                !isValidPort(dbPort)
            ) {

                showError(
                    "Database Port must be between 1 and 65535."
                );

                return;
            }


            if (!dbName) {

                showError(
                    "Please enter the Database Name."
                );

                return;
            }


            if (!dbUsername) {

                showError(
                    "Please enter the Database Username."
                );

                return;
            }


            const configuration = {

                serverHost:
                    host,

                serverPort:
                    port,

                lanAccess:
                    lanAccess.value,

                applicationName:
                    appName,

                databaseHost:
                    dbHost,

                databasePort:
                    dbPort,

                databaseName:
                    dbName,

                databaseUsername:
                    dbUsername,

                databasePassword:
                    databasePassword.value

            };


            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    configuration
                )
            );


            updateClientAccessUrl();


            lanStatus.textContent =
                lanAccess.value ===
                "enabled"
                    ? "Enabled"
                    : "Disabled";


            showSuccess(
                "Server configuration saved successfully."
            );

        }
    );


    /* =====================================================
       RESET CONFIGURATION
       ===================================================== */

    resetButton.addEventListener(
        "click",
        () => {

            const confirmed =
                confirm(
                    "Reset all server configuration settings to their defaults?"
                );


            if (!confirmed) {
                return;
            }


            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    defaultConfiguration
                )
            );


            displayConfiguration();


            showSuccess(
                "Server configuration has been reset."
            );

        }
    );


    /* =====================================================
       LIVE URL UPDATE
       ===================================================== */

    serverHost.addEventListener(
        "input",
        updateClientAccessUrl
    );

    serverPort.addEventListener(
        "input",
        updateClientAccessUrl
    );


    /* =====================================================
       MESSAGE HELPERS
       ===================================================== */

    function showSuccess(
        text
    ) {

        message.style.color =
            "#17633a";

        message.textContent =
            text;

    }


    function showError(
        text
    ) {

        message.style.color =
            "#c0392b";

        message.textContent =
            text;

    }


    /* =====================================================
       LOGOUT
       ===================================================== */

    document
        .getElementById(
            "logoutButton"
        )
        .addEventListener(
            "click",
            () => {

                sessionStorage.removeItem(
                    "vetCurrentUser"
                );

                window.location.href =
                    "../../index.html";

            }
        );


    /* =====================================================
       INITIAL LOAD
       ===================================================== */

    displayConfiguration();

});