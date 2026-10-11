
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    /* =====================================================
       GET LOGIN VALUES
    ===================================================== */

    const username = document
        .getElementById("username")
        .value
        .trim()
        .toLowerCase();

    const password = document
        .getElementById("password")
        .value;

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!username || !password) {
        loginMessage.style.color = "#c0392b";
        loginMessage.textContent =
            "Please enter your username and password.";
        return;
    }

    /* =====================================================
       PREVENT MULTIPLE LOGIN REQUESTS
    ===================================================== */

    const submitButton = loginForm.querySelector(
        'button[type="submit"], input[type="submit"]'
    );

    if (submitButton) {
        submitButton.disabled = true;
    }

    loginMessage.style.color = "#555";
    loginMessage.textContent = "Signing in...";

    try {
        /* =====================================================
           AUTHENTICATE THROUGH THE BACKEND AND MYSQL
        ===================================================== */

        const response = await fetch(
            "http://localhost:3000/api/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );

        const result = await response.json();

        /* =====================================================
           HANDLE LOGIN FAILURE
        ===================================================== */

        if (
            !response.ok ||
            result.success !== true ||
            !result.data
        ) {
            loginMessage.style.color = "#c0392b";
            loginMessage.textContent =
                result.message ||
                "Invalid username or password.";
            return;
        }

        /* =====================================================
           VALIDATE DATABASE USER ID
        ===================================================== */

        const databaseUserId = Number(result.data.userId);

        if (
            !Number.isInteger(databaseUserId) ||
            databaseUserId <= 0
        ) {
            loginMessage.style.color = "#c0392b";
            loginMessage.textContent =
                "Login failed because the database user ID is invalid.";
            return;
        }

        /* =====================================================
           GET AUTHENTICATED USER DETAILS
        ===================================================== */

        const role = String(result.data.role || "").trim();

        const loggedInUser = {
            userId: databaseUserId,
            username: result.data.username,
            fullName: result.data.fullName,
            role: role
        };

        /* =====================================================
           DETERMINE THE USER'S ACCESS
        ===================================================== */

        const normalizedRole = role.toLowerCase();

        const isAdministrator =
            normalizedRole === "admin" ||
            normalizedRole === "administrator";

        const isClientStaff =
            normalizedRole === "staff" ||
            normalizedRole === "front desk" ||
            normalizedRole === "veterinarian";

        if (!isAdministrator && !isClientStaff) {
            loginMessage.style.color = "#c0392b";
            loginMessage.textContent =
                "This account does not have permission to access the system.";
            return;
        }

        /* =====================================================
           SAVE AUTHENTICATED SESSION
        ===================================================== */

        // Remove any previous temporary or demo session.
        sessionStorage.removeItem("vetCurrentUser");
        sessionStorage.removeItem("demoUsername");
        sessionStorage.removeItem("demoRole");

        // Store the real numeric user ID returned by MySQL.
        sessionStorage.setItem(
            "vetCurrentUser",
            JSON.stringify(loggedInUser)
        );

        // Retain these values for older frontend scripts.
        sessionStorage.setItem(
            "demoUsername",
            loggedInUser.username
        );

        sessionStorage.setItem(
            "demoRole",
            loggedInUser.role
        );

        /* =====================================================
           LOGIN SUCCESS
        ===================================================== */

        loginMessage.style.color = "#2a9d8f";
        loginMessage.textContent =
            "Login successful. Redirecting...";

        /* =====================================================
           REDIRECT BY ROLE
        ===================================================== */

        
        if (isAdministrator) {
            window.location.href = "/server/pages/dashboard.html";
        } else {
            window.location.href = "/client/pages/dashboard.html";
        }


    } catch (error) {
        console.error("Login error:", error);

        loginMessage.style.color = "#c0392b";
        loginMessage.textContent =
            "Unable to connect to the login service. Make sure the Node.js backend and C# Bridge are running.";

    } finally {
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
});
