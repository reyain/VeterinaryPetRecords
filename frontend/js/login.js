const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");


loginForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        const username =
            document
                .getElementById("username")
                .value
                .trim();

        const password =
            document
                .getElementById("password")
                .value
                .trim();


        if (!username || !password) {

            loginMessage.style.color =
                "#c0392b";

            loginMessage.textContent =
                "Please enter your username and password.";

            return;
        }


        /*
            TEMPORARY FRONTEND TEST ACCOUNTS

            These are NOT real system accounts.

            Real authentication will later use:

            Browser
                ↓
            Node.js + Express
                ↓
            C# Bridge
                ↓
            Core DLL
                ↓
            MySQL users table
        */

        const demoAccounts = {

            admin: {
                password: "admin123",
                fullName: "Administrator",
                role: "Administrator"
            },

            frontdesk: {
                password: "front123",
                fullName: "Front Desk",
                role: "Front Desk"
            },

            veterinarian: {
                password: "vet123",
                fullName: "Veterinarian",
                role: "Veterinarian"
            }

        };


        const account =
            demoAccounts[username.toLowerCase()];


        if (
            !account ||
            account.password !== password
        ) {

            loginMessage.style.color =
                "#c0392b";

            loginMessage.textContent =
                "Invalid username or password.";

            return;
        }


        /*
            Save temporary session information
            for frontend testing only.

            This structure is used by both
            Client and Server dashboards.
        */

        const loggedInUser = {

            username:
                username.toLowerCase(),

            fullName:
                account.fullName,

            role:
                account.role

        };


        sessionStorage.setItem(
            "vetCurrentUser",
            JSON.stringify(loggedInUser)
        );


        loginMessage.style.color =
            "#2a9d8f";

        loginMessage.textContent =
            "Login successful. Redirecting...";


        setTimeout(() => {

            /*
                Administrator → Server Dashboard
            */

            if (
                account.role ===
                "Administrator"
            ) {

                window.location.href =
                    "server/pages/dashboard.html";

            }

            /*
                Front Desk / Veterinarian
                → Client Dashboard
            */

            else {

                window.location.href =
                    "client/pages/dashboard.html";

            }

        }, 500);

    }
);