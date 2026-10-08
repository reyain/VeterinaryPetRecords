const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");


loginForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        /* =====================================================
           GET LOGIN VALUES
        ===================================================== */

        const username =
            document
                .getElementById("username")
                .value
                .trim()
                .toLowerCase();

        const password =
            document
                .getElementById("password")
                .value;


        /* =====================================================
           VALIDATION
        ===================================================== */

        if (!username || !password) {

            loginMessage.style.color =
                "#c0392b";

            loginMessage.textContent =
                "Please enter your username and password.";

            return;
        }


        /* =====================================================
           TEMPORARY ADMINISTRATOR ACCOUNT
        ===================================================== */

        if (
            username === "admin" &&
            password === "admin123"
        ) {

            const loggedInUser = {

                userId: "ADMIN-0001",

                username: "admin",

                fullName: "Administrator",

                role: "Administrator"

            };


            /*
                MAIN SESSION
            */

            sessionStorage.setItem(
                "vetCurrentUser",
                JSON.stringify(loggedInUser)
            );


            /*
                LEGACY SESSION VALUES
                Kept temporarily so older client
                scripts do not reject the session.
            */

            sessionStorage.setItem(
                "demoUsername",
                "admin"
            );

            sessionStorage.setItem(
                "demoRole",
                "Administrator"
            );


            loginMessage.style.color =
                "#2a9d8f";

            loginMessage.textContent =
                "Login successful. Redirecting...";


            setTimeout(() => {

                window.location.href =
                    "server/pages/dashboard.html";

            }, 500);


            return;
        }


        /* =====================================================
           LOAD STAFF ACCOUNTS
        ===================================================== */

        let staffAccounts = [];


        const savedStaffAccounts =
            localStorage.getItem(
                "vetStaffAccounts"
            );


        if (savedStaffAccounts) {

            try {

                const parsed =
                    JSON.parse(
                        savedStaffAccounts
                    );


                if (
                    Array.isArray(parsed)
                ) {

                    staffAccounts =
                        parsed;

                }

            } catch (error) {

                console.error(
                    "Unable to read staff accounts:",
                    error
                );

            }

        }


        /* =====================================================
           FALLBACK STAFF ACCOUNTS
        ===================================================== */

        if (
            staffAccounts.length === 0
        ) {

            staffAccounts = [

                {
                    userId:
                        "USR-0001",

                    username:
                        "frontdesk",

                    password:
                        "front123",

                    fullName:
                        "Front Desk",

                    role:
                        "Front Desk",

                    status:
                        "Active"

                },

                {
                    userId:
                        "USR-0002",

                    username:
                        "veterinarian",

                    password:
                        "vet123",

                    fullName:
                        "Veterinarian",

                    role:
                        "Veterinarian",

                    status:
                        "Active"

                }

            ];

        }


        /* =====================================================
           FIND STAFF USERNAME
        ===================================================== */

        const staffAccount =
            staffAccounts.find(
                account => {

                    const storedUsername =
                        String(
                            account.username || ""
                        )
                        .trim()
                        .toLowerCase();


                    return (
                        storedUsername ===
                        username
                    );

                }
            );


        /* =====================================================
           ACCOUNT NOT FOUND
        ===================================================== */

        if (!staffAccount) {

            loginMessage.style.color =
                "#c0392b";

            loginMessage.textContent =
                "Invalid username or password.";

            return;
        }


        /* =====================================================
           CHECK STATUS
        ===================================================== */

        const accountStatus =
            String(
                staffAccount.status ||
                "Active"
            )
            .trim()
            .toLowerCase();


        if (
            accountStatus === "inactive"
        ) {

            loginMessage.style.color =
                "#c0392b";

            loginMessage.textContent =
                "This account is inactive. Please contact the Administrator.";

            return;
        }


        /* =====================================================
           CHECK PASSWORD
        ===================================================== */

        if (
            String(
                staffAccount.password || ""
            ) !== password
        ) {

            loginMessage.style.color =
                "#c0392b";

            loginMessage.textContent =
                "Invalid username or password.";

            return;
        }


        /* =====================================================
           CHECK ROLE
        ===================================================== */

        const role =
            String(
                staffAccount.role || ""
            )
            .trim();


        if (
            role !== "Front Desk" &&
            role !== "Veterinarian"
        ) {

            loginMessage.style.color =
                "#c0392b";

            loginMessage.textContent =
                "This account does not have Client System access.";

            return;
        }


        /* =====================================================
           CREATE COMMON SESSION
        ===================================================== */

        const loggedInUser = {

            userId:
                staffAccount.userId || "",

            username:
                staffAccount.username,

            fullName:
                staffAccount.fullName ||
                staffAccount.username,

            role:
                role

        };


        /* =====================================================
           SAVE MAIN SESSION
        ===================================================== */

        sessionStorage.setItem(
            "vetCurrentUser",
            JSON.stringify(loggedInUser)
        );


        /* =====================================================
           SAVE LEGACY SESSION VALUES
           For compatibility with older client scripts
        ===================================================== */

        sessionStorage.setItem(
            "demoUsername",
            staffAccount.username
        );


        sessionStorage.setItem(
            "demoRole",
            staffAccount.role
        );


        /* =====================================================
           LOGIN SUCCESS
        ===================================================== */

        loginMessage.style.color =
            "#2a9d8f";

        loginMessage.textContent =
            "Login successful. Redirecting...";


        setTimeout(() => {

            window.location.href =
                "client/pages/dashboard.html";

        }, 500);

    }
);